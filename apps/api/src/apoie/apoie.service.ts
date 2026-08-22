import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ApoioNivel,
  ApoioPeriodicidade,
  ApoioPlataformaStatus,
} from '@axemap/shared';

export interface NivelApoioConfig {
  nivel: ApoioNivel;
  valor: number;
  titulo: string;
  descricao: string;
  beneficio: string;
}

/**
 * Catálogo de níveis do Círculo de Apoiadores (Prompt 14, seção 04).
 * IMPORTANTE: valores de apoio NUNCA alteram Trust, verificação, reputação,
 * autoridade ou posição orgânica. "DINHEIRO NÃO COMPRA CONFIANÇA."
 */
export const NIVEIS_APOIO: NivelApoioConfig[] = [
  {
    nivel: ApoioNivel.SEMENTE,
    valor: 5,
    titulo: 'Semente',
    descricao: 'Para quem quer começar a regar esse projeto coletivo.',
    beneficio: 'Nome no mural de apoiadores do AxéMap.',
  },
  {
    nivel: ApoioNivel.GUARDIAO,
    valor: 10,
    titulo: 'Guardião',
    descricao: 'Ajuda a manter a infraestrutura da plataforma no ar.',
    beneficio: 'Acesso antecipado a novidades e selo de guardião.',
  },
  {
    nivel: ApoioNivel.AXE,
    valor: 15,
    titulo: 'Axé',
    descricao: 'Fortalece a manutenção e a moderação comunitária.',
    beneficio: 'Inscrição em sorteios culturais comunitários.',
  },
  {
    nivel: ApoioNivel.MEMORIA,
    valor: 20,
    titulo: 'Memória',
    descricao: 'Contribui para a digitalização do patrimônio cultural.',
    beneficio: 'Relatórios trimestrais de transparência em detalhe.',
  },
  {
    nivel: ApoioNivel.ANCESTRALIDADE,
    valor: 50,
    titulo: 'Ancestralidade',
    descricao: 'Sustenta projetos de preservação e registro histórico.',
    beneficio: 'Reconhecimento especial no mural anual de ancestralidade.',
  },
  {
    nivel: ApoioNivel.MANTENEDOR,
    valor: 100,
    titulo: 'Mantenedor',
    descricao: 'Parceria institucional de sustentação da plataforma.',
    beneficio: 'Conversa institucional anual com a governança.',
  },
];

const MAX_MENSAGEM_LEN = 600;

@Injectable()
export class ApoieService {
  constructor(private prisma: PrismaService) {}

  /** Catálogo público de níveis (sem dados de quem apoia). */
  listarNiveis() {
    return {
      data: NIVEIS_APOIO.map((n) => ({
        nivel: n.nivel,
        valor: n.valor,
        titulo: n.titulo,
        descricao: n.descricao,
        beneficio: n.beneficio,
      })),
      total: NIVEIS_APOIO.length,
    };
  }

  private obterNivel(nivel: string): NivelApoioConfig {
    const cfg = NIVEIS_APOIO.find((n) => n.nivel === nivel);
    if (!cfg) {
      throw new BadRequestException(
        `Nível inválido. Use um de: ${NIVEIS_APOIO.map((n) => n.nivel).join(', ')}`,
      );
    }
    return cfg;
  }

  /**
   * Registra uma contribuição à plataforma. O pagamento fica PENDENTE até
   * confirmação (admin ou, no futuro, webhook do gateway). Nenhum gateway
   * fictício é simulado — apenas gera-se referência de Pix mock para checkout,
   * seguindo o mesmo padrão do módulo saas.
   */
  async contribuir(
    usuarioId: string,
    dto: { nivel: string; periodicidade?: ApoioPeriodicidade; anonimo?: boolean; mensagem?: string },
  ) {
    const cfg = this.obterNivel(dto.nivel);
    const periodicidade = dto.periodicidade ?? ApoioPeriodicidade.AVULSO;
    const anonimo = dto.anonimo ?? false;
    const mensagem = dto.mensagem ? dto.mensagem.slice(0, MAX_MENSAGEM_LEN) : null;

    if (dto.mensagem && dto.mensagem.length > MAX_MENSAGEM_LEN) {
      throw new BadRequestException(`mensagem excede ${MAX_MENSAGEM_LEN} caracteres`);
    }

    const gatewayRef = `apoio-${usuarioId.slice(0, 8)}-${Date.now().toString(36)}`;

    const apoio = await this.prisma.apoioPlataforma.create({
      data: {
        valor: cfg.valor,
        nivel: cfg.nivel,
        periodicidade,
        status: ApoioPlataformaStatus.PENDENTE,
        anonimo,
        mensagem,
        apoiadorId: usuarioId,
        gatewayRef,
      },
    });

    const pix = this.gerarPixCopiaCola(cfg.titulo, cfg.valor);

    return {
      id: apoio.id,
      nivel: apoio.nivel,
      valor: apoio.valor,
      periodicidade: apoio.periodicidade,
      status: apoio.status,
      anonimo: apoio.anonimo,
      criadoEm: apoio.createdAt,
      pix,
      mensagem:
        'Apoio registrado. Após o pagamento, ele será confirmado pela equipe e divulgado no mural de transparência (se não for anônimo).',
    };
  }

  /** Contribuições do usuário autenticado. */
  async minhasContribuicoes(usuarioId: string, limite = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.apoioPlataforma.findMany({
        where: { apoiadorId: usuarioId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.apoioPlataforma.count({ where: { apoiadorId: usuarioId } }),
    ]);
    return { data, total };
  }

  /**
   * Transparência financeira pública da plataforma (seção 07 do Prompt 14).
   * Exibe apenas dados agregados e não sensíveis. Nunca expõe valores
   * individuais de apoiadores anônimos.
   */
  async transparencia() {
    const [agregados, porNivel, recentesConfirmados, totalApoiadores] = await Promise.all([
      this.prisma.apoioPlataforma.aggregate({
        where: { status: ApoioPlataformaStatus.CONFIRMADO },
        _sum: { valor: true },
        _count: true,
      }),
      this.prisma.apoioPlataforma.groupBy({
        by: ['nivel'],
        where: { status: ApoioPlataformaStatus.CONFIRMADO },
        _sum: { valor: true },
        _count: { _all: true },
        orderBy: { _sum: { valor: 'desc' } },
      }),
      this.prisma.apoioPlataforma.findMany({
        where: { status: ApoioPlataformaStatus.CONFIRMADO, anonimo: false },
        orderBy: { pagoEm: 'desc' },
        take: 50,
        select: {
          nivel: true,
          valor: true,
          pagoEm: true,
          apoiador: { select: { nome: true } },
        },
      }),
      this.prisma.apoioPlataforma.groupBy({
        by: ['apoiadorId'],
        where: { status: ApoioPlataformaStatus.CONFIRMADO },
        _count: { _all: true },
      }),
    ]);

    return {
      resumo: {
        totalArrecadado: Math.round((agregados._sum.valor ?? 0) * 100) / 100,
        totalContribuicoes: agregados._count,
        totalApoiadores: totalApoiadores.length,
      },
      porNivel: porNivel.map((g) => ({
        nivel: g.nivel,
        total: Math.round((g._sum.valor ?? 0) * 100) / 100,
        contribuicoes: g._count._all,
      })),
      mural: recentesConfirmados.map((r) => ({
        nivel: r.nivel,
        valor: r.valor,
        nome: r.apoiador.nome,
        pagoEm: r.pagoEm,
      })),
    };
  }

  // =================================================================
  //  ADMIN (confirmação manual de pagamentos)
  // =================================================================

  async listarContribuicoes(status?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.apoioPlataforma.findMany({
        where,
        include: {
          apoiador: { select: { id: true, nome: true, email: true } },
          confirmadoPor: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.apoioPlataforma.count({ where }),
    ]);
    return { data, total };
  }

  async confirmar(apoioId: string, confirmadoPorId: string) {
    const apoio = await this.prisma.apoioPlataforma.findUnique({ where: { id: apoioId } });
    if (!apoio) throw new NotFoundException('Apoio não encontrado');
    if (apoio.status !== ApoioPlataformaStatus.PENDENTE) {
      throw new ConflictException('Apoio já processado');
    }

    return this.prisma.apoioPlataforma.update({
      where: { id: apoioId },
      data: {
        status: ApoioPlataformaStatus.CONFIRMADO,
        pagoEm: new Date(),
        confirmadoPorId,
      },
    });
  }

  async recusar(apoioId: string, confirmadoPorId: string) {
    const apoio = await this.prisma.apoioPlataforma.findUnique({ where: { id: apoioId } });
    if (!apoio) throw new NotFoundException('Apoio não encontrado');
    if (apoio.status !== ApoioPlataformaStatus.PENDENTE) {
      throw new ConflictException('Apoio já processado');
    }

    return this.prisma.apoioPlataforma.update({
      where: { id: apoioId },
      data: {
        status: ApoioPlataformaStatus.CANCELADO,
        confirmadoPorId,
      },
    });
  }

  private gerarPixCopiaCola(titulo: string, valor: number): string {
    // Mock Pix copy-paste — em produção será gerado pelo gateway (Stripe/Mercado Pago/Asaas).
    return `00020126BR 14br.gov.bcb.pix 0114AXEMAP0000000000 ✓52040000530398654${valor.toFixed(0).padStart(10, '0')} 5802BR5907AXEMAP 6007BRASIL 62070503***6304RECEP`;
  }
}
