import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  PlanoCiclo,
  PlanoAssinaturaStatus,
  PlanoPagamentoMetodo,
  PlanoPagamentoStatus,
  TransacaoTipo,
} from '@axemap/shared';

const calcularPreco = (plano: { precoMensal: number; precoAnual: number | null }, ciclo: PlanoCiclo) =>
  ciclo === PlanoCiclo.ANUAL ? (plano.precoAnual ?? plano.precoMensal * 12) : plano.precoMensal;

const MESES_POR_CICLO: Record<PlanoCiclo, number> = {
  MENSAL: 1,
  ANUAL: 12,
};

@Injectable()
export class SaasService {
  constructor(private prisma: PrismaService) {}

  // =================================================================
  //  CATÁLOGO DE PLANOS (público + admin)
  // =================================================================

  async listarPlanos(incluirInativos = false) {
    return this.prisma.planoSaaS.findMany({
      where: incluirInativos ? {} : { ativo: true },
      orderBy: { ordem: 'asc' },
    });
  }

  async obterPlano(slug: string) {
    const plano = await this.prisma.planoSaaS.findUnique({ where: { slug } });
    if (!plano) throw new NotFoundException('Plano não encontrado');
    return plano;
  }

  async criarPlano(dto: {
    slug: string;
    nome: string;
    descricao?: string;
    precoMensal: number;
    precoAnual?: number;
    destaque?: boolean;
    funcionalidades?: string[];
    limites?: any;
    ordem?: number;
    ativo?: boolean;
  }) {
    const existente = await this.prisma.planoSaaS.findUnique({ where: { slug: dto.slug } });
    if (existente) throw new ConflictException('Já existe um plano com este slug');
    if (!dto.nome || !dto.slug) throw new BadRequestException('slug e nome são obrigatórios');

    return this.prisma.planoSaaS.create({
      data: {
        slug: dto.slug,
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        precoMensal: dto.precoMensal ?? 0,
        precoAnual: dto.precoAnual ?? null,
        destaque: dto.destaque ?? false,
        funcionalidades: dto.funcionalidades ?? [],
        limites: dto.limites ?? null,
        ordem: dto.ordem ?? 0,
        ativo: dto.ativo ?? true,
      },
    });
  }

  async atualizarPlano(id: string, dto: any) {
    const plano = await this.prisma.planoSaaS.findUnique({ where: { id } });
    if (!plano) throw new NotFoundException('Plano não encontrado');
    const data: any = {};
    if (dto.nome !== undefined) data.nome = dto.nome;
    if (dto.descricao !== undefined) data.descricao = dto.descricao;
    if (dto.precoMensal !== undefined) data.precoMensal = dto.precoMensal;
    if (dto.precoAnual !== undefined) data.precoAnual = dto.precoAnual;
    if (dto.destaque !== undefined) data.destaque = dto.destaque;
    if (dto.funcionalidades !== undefined) data.funcionalidades = dto.funcionalidades;
    if (dto.limites !== undefined) data.limites = dto.limites;
    if (dto.ordem !== undefined) data.ordem = dto.ordem;
    if (dto.ativo !== undefined) data.ativo = dto.ativo;

    return this.prisma.planoSaaS.update({ where: { id }, data });
  }

  async removerPlano(id: string) {
    const plano = await this.prisma.planoSaaS.findUnique({
      where: { id },
      include: { assinaturas: { take: 1 } },
    });
    if (!plano) throw new NotFoundException('Plano não encontrado');
    if (plano.assinaturas.length > 0) {
      return this.prisma.planoSaaS.update({ where: { id }, data: { ativo: false } });
    }
    return this.prisma.planoSaaS.delete({ where: { id } });
  }

  // =================================================================
  //  ASSINATURA (dirigente)
  // =================================================================

  private async verificarDirigente(usuarioId: string, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { id: true, nome: true, dirigenteId: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId !== usuarioId) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar assinatura e financeiro');
    }
    return terreiro;
  }

  async assinaturaAtual(terreiroId: string) {
    const assinatura = await this.prisma.planoAssinatura.findFirst({
      where: { terreiroId, status: PlanoAssinaturaStatus.ATIVO },
      orderBy: { iniciadoEm: 'desc' },
      include: {
        plano: true,
        pagamentos: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    return assinatura;
  }

  async listarAssinaturas() {
    const assinaturas = await this.prisma.planoAssinatura.findMany({
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        plano: { select: { nome: true, slug: true } },
        pagamentos: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { iniciadoEm: 'desc' },
    });
    return assinaturas;
  }

  /** Cria/envia assinatura. O pagamento fica PENDENTE até confirmação (admin ou gateway). */
  async assinar(usuarioId: string, dto: { terreiroId: string; planoSlug: string; ciclo: PlanoCiclo; metodo?: PlanoPagamentoMetodo }) {
    await this.verificarDirigente(usuarioId, dto.terreiroId);

    const plano = await this.prisma.planoSaaS.findUnique({ where: { slug: dto.planoSlug } });
    if (!plano) throw new NotFoundException('Plano não encontrado');
    if (!plano.ativo) throw new BadRequestException('Este plano não está mais disponível');

    const ciclo = dto.ciclo ?? PlanoCiclo.MENSAL;
    const metodo = dto.metodo ?? PlanoPagamentoMetodo.PIX;
    const valor = calcularPreco(plano, ciclo);

    const ativa = await this.prisma.planoAssinatura.findFirst({
      where: { terreiroId: dto.terreiroId, status: PlanoAssinaturaStatus.ATIVO },
    });
    if (ativa) {
      throw new ConflictException('O terreiro já possui uma assinatura ativa. Cancele-a antes de trocar de plano.');
    }

    const agora = new Date();
    const renovarEm = new Date(agora);
    renovarEm.setMonth(renovarEm.getMonth() + MESES_POR_CICLO[ciclo]);

    const ehGratis = valor <= 0;
    const assinatura = await this.prisma.planoAssinatura.create({
      data: {
        status: ehGratis ? PlanoAssinaturaStatus.ATIVO : PlanoAssinaturaStatus.PENDENTE,
        ciclo,
        valor: Math.round(valor * 100) / 100,
        iniciadoEm: agora,
        renovarEm,
        terreiroId: dto.terreiroId,
        planoId: plano.id,
      },
    });

    if (ehGratis) {
      return {
        assinatura: { id: assinatura.id, status: assinatura.status, ciclo, renovarEm: assinatura.renovarEm },
        pagamento: null,
        plano: { slug: plano.slug, nome: plano.nome },
      };
    }

    const pagamento = await this.prisma.planoPagamento.create({
      data: {
        valor: Math.round(valor * 100) / 100,
        metodo,
        status: PlanoPagamentoStatus.PENDENTE,
        referencia: this.gerarPixCopiaCola(plano.nome, valor),
        assinaturaId: assinatura.id,
      },
    });

    return {
      assinatura: { id: assinatura.id, status: assinatura.status, ciclo, renovarEm: assinatura.renovarEm },
      pagamento: { id: pagamento.id, valor: pagamento.valor, metodo, status: pagamento.status, pix: pagamento.referencia },
      plano: { slug: plano.slug, nome: plano.nome },
    };
  }

  /** Cancela assinatura ativa do terreiro. */
  async cancelarAssinatura(usuarioId: string, terreiroId: string) {
    await this.verificarDirigente(usuarioId, terreiroId);
    const assinatura = await this.prisma.planoAssinatura.findFirst({
      where: { terreiroId, status: PlanoAssinaturaStatus.ATIVO },
    });
    if (!assinatura) throw new NotFoundException('Nenhuma assinatura ativa encontrada');

    return this.prisma.planoAssinatura.update({
      where: { id: assinatura.id },
      data: { status: PlanoAssinaturaStatus.CANCELADO, canceladoEm: new Date() },
    });
  }

  // =================================================================
  //  PAGAMENTOS (admin confirma; gateway webhook no futuro)
  // =================================================================

  async confirmarPagamento(pagamentoId: string, confirmadoPorId: string) {
    const pagamento = await this.prisma.planoPagamento.findUnique({
      where: { id: pagamentoId },
      include: { assinatura: true },
    });
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');
    if (pagamento.status !== PlanoPagamentoStatus.PENDENTE) {
      throw new ConflictException('Pagamento já processado');
    }

    const jaAtiva = await this.prisma.planoAssinatura.findFirst({
      where: { terreiroId: pagamento.assinatura.terreiroId, status: PlanoAssinaturaStatus.ATIVO },
    });
    if (jaAtiva) throw new ConflictException('O terreiro já possui assinatura ativa');

    await this.prisma.planoPagamento.update({
      where: { id: pagamentoId },
      data: { status: PlanoPagamentoStatus.CONFIRMADO, pagoEm: new Date(), confirmadoPorId },
    });

    return this.prisma.planoAssinatura.update({
      where: { id: pagamento.assinaturaId },
      data: { status: PlanoAssinaturaStatus.ATIVO },
      include: { plano: true },
    });
  }

  async listarPagamentosPendentes() {
    return this.prisma.planoPagamento.findMany({
      where: { status: PlanoPagamentoStatus.PENDENTE },
      include: {
        assinatura: {
          include: {
            terreiro: { select: { nome: true, slug: true } },
            plano: { select: { nome: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private gerarPixCopiaCola(titulo: string, valor: number): string {
    // Mock Pix copy-paste — em produção será gerado pelo gateway (Stripe/Mercado Pago/Asaas).
    return `00020126BR 14br.gov.bcb.pix 0114AXEMAP0000000000 ✓52040000530398654${valor.toFixed(0).padStart(10, '0')} 5802BR5907AXEMAP 6007BRASIL 62070503***6304RECEP`;
  }

  // =================================================================
  //  FINANCEIRO (receitas, despesas, extrato, Pix)
  // =================================================================

  async lancarTransacao(usuarioId: string, dto: {
      terreiroId: string;
      tipo: TransacaoTipo;
      categoria: string;
      valor: number;
      descricao?: string;
      data?: string;
      origem?: string;
    },
  ) {
    await this.verificarDirigente(usuarioId, dto.terreiroId);
    if (!dto.categoria || !dto.valor || dto.valor <= 0 || !dto.tipo) {
      throw new BadRequestException('tipo, categoria e valor (positivo) são obrigatórios');
    }

    return this.prisma.transacaoFinanceira.create({
      data: {
        tipo: dto.tipo,
        categoria: dto.categoria,
        valor: Math.round(dto.valor * 100) / 100,
        descricao: dto.descricao ?? null,
        data: dto.data ? new Date(dto.data) : new Date(),
        origem: (dto.origem as any) ?? 'OUTRO',
        terreiroId: dto.terreiroId,
        registradoPorId: usuarioId,
      },
    });
  }

  async listarTransacoes(terreiroId: string, tipo?: TransacaoTipo, periodo?: string, limite = 50, offset = 0) {
    const where: any = { terreiroId, deletedAt: null };
    if (tipo) where.tipo = tipo;

    // periodo aceita: mes=YYYY-MM
    if (periodo) {
      const [ano, mes] = periodo.split('-').map(Number);
      if (ano && mes) {
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 1);
        where.data = { gte: inicio, lt: fim };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.transacaoFinanceira.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: offset,
        take: Math.min(limite, 100),
      }),
      this.prisma.transacaoFinanceira.count({ where }),
    ]);
    return { data, total };
  }

  async resumoFinanceiro(terreiroId: string, periodo?: string) {
    const where: any = { terreiroId, deletedAt: null };
    if (periodo) {
      const [ano, mes] = periodo.split('-').map(Number);
      if (ano && mes) {
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 1);
        where.data = { gte: inicio, lt: fim };
      }
    }

    const [receitas, despesas, recentes, pix] = await Promise.all([
      this.prisma.transacaoFinanceira.aggregate({
        where: { ...where, tipo: TransacaoTipo.RECEITA },
        _sum: { valor: true },
        _count: true,
      }),
      this.prisma.transacaoFinanceira.aggregate({
        where: { ...where, tipo: TransacaoTipo.DESPESA },
        _sum: { valor: true },
        _count: true,
      }),
      this.prisma.transacaoFinanceira.findMany({
        where,
        orderBy: { data: 'desc' },
        take: 10,
      }),
      this.prisma.pixConfiguracao.findUnique({ where: { terreiroId } }),
    ]);

    const totalReceitas = receitas._sum.valor ?? 0;
    const totalDespesas = despesas._sum.valor ?? 0;

    return {
      periodo: periodo ?? null,
      receitas: { total: Math.round(totalReceitas * 100) / 100, quantidade: receitas._count },
      despesas: { total: Math.round(totalDespesas * 100) / 100, quantidade: despesas._count },
      saldo: Math.round((totalReceitas - totalDespesas) * 100) / 100,
      recentes,
      pix,
    };
  }

  async atualizarTransacao(usuarioId: string, id: string, dto: {
    tipo?: TransacaoTipo;
    categoria?: string;
    valor?: number;
    descricao?: string;
    data?: string;
  }) {
    const t = await this.prisma.transacaoFinanceira.findUnique({
      where: { id },
      select: { id: true, terreiroId: true },
    });
    if (!t) throw new NotFoundException('Transação não encontrada');
    await this.verificarDirigente(usuarioId, t.terreiroId);

    return this.prisma.transacaoFinanceira.update({
      where: { id },
      data: {
        ...(dto.categoria ? { categoria: dto.categoria } : {}),
        ...(dto.valor != null ? { valor: Math.round(dto.valor * 100) / 100 } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.data ? { data: new Date(dto.data) } : {}),
        ...(dto.tipo ? { tipo: dto.tipo } : {}),
      },
    });
  }

  async removerTransacao(usuarioId: string, id: string) {
    const t = await this.prisma.transacaoFinanceira.findUnique({
      where: { id },
      select: { id: true, terreiroId: true },
    });
    if (!t) throw new NotFoundException('Transação não encontrada');
    await this.verificarDirigente(usuarioId, t.terreiroId);
    return this.prisma.transacaoFinanceira.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async salvarPix(usuarioId: string, terreiroId: string, dto: { chave: string; tipoChave: string; titulo?: string; ativo?: boolean }) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: terreiroId }, select: { id: true } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    await this.verificarDirigente(usuarioId, terreiroId);
    if (!dto.chave?.trim()) throw new BadRequestException('Chave Pix é obrigatória');

    return this.prisma.pixConfiguracao.upsert({
      where: { terreiroId },
      create: {
        terreiroId,
        chave: dto.chave.trim(),
        tipoChave: (dto.tipoChave as any) ?? 'EMAIL',
        titulo: dto.titulo ?? 'Doação para o terreiro',
        ativo: dto.ativo ?? true,
      },
      update: {
        chave: dto.chave.trim(),
        tipoChave: (dto.tipoChave as any) ?? 'EMAIL',
        titulo: dto.titulo,
        ativo: dto.ativo,
      },
    });
  }
}