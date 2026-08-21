import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { generateSlug } from '@axemap/shared';

@Injectable()
export class CampanhasAdminService {
  constructor(private prisma: PrismaService) {}

  async listar(status?: string, q?: string, limit = 50, offset = 0) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { categoria: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.campanhas.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true } },
          instituicao: { select: { id: true, nome: true } },
          _count: { select: { apoios: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset,
      }),
      this.prisma.campanhas.count({ where }),
    ]);
    return { data, total };
  }

  async pendentes() {
    const where: any = {
      deletedAt: null,
      status: {
        in: [
          'PENDENTE_ANALISE',
          'EM_ANALISE_IA',
          'AGUARDANDO_DOCUMENTOS',
          'EM_REVISAO_HUMANA',
        ],
      },
    };
    const [data, total] = await Promise.all([
      this.prisma.campanhas.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true } },
          instituicao: { select: { id: true, nome: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      }),
      this.prisma.campanhas.count({ where }),
    ]);
    return { data, total };
  }

  async detalhe(id: string) {
    const campanha = await this.prisma.campanhas.findUnique({
      where: { id },
      include: {
        criadoPor: { select: { id: true, nome: true, email: true, role: true } },
        revisadoPor: { select: { id: true, nome: true } },
        terreiro: { select: { id: true, nome: true, slug: true } },
        instituicao: { select: { id: true, nome: true } },
        documentos: true,
        atualizacoes: { orderBy: { createdAt: 'desc' }, take: 50 },
        prestacoesContas: { orderBy: { data: 'desc' } },
        apoios: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    return campanha;
  }

  async criar(dto: any, usuarioId: string) {
    if (!dto.titulo || !dto.descricao || !dto.categoria || !dto.modelo) {
      throw new BadRequestException(
        'titulo, descricao, categoria e modelo são obrigatórios',
      );
    }
    const meta = Number(dto.metaFinanceira ?? 0);
    if (meta <= 0) throw new BadRequestException('Meta financeira inválida');

    const data: any = {
      titulo: dto.titulo,
      slug: this.gerarSlug(dto.titulo),
      descricao: dto.descricao,
      historia: dto.historia ?? null,
      objetivo: dto.objetivo ?? null,
      categoria: dto.categoria,
      modeloArrecad: dto.modelo,
      metaFinanceira: meta,
      criadoPorId: usuarioId,
      dataInicio: new Date(),
      cidade: dto.cidade ?? null,
      estado: dto.estado ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      responsavelNome: dto.responsavelNome ?? null,
      responsavelDocumento: dto.responsavelDocumento ?? null,
    };

    if (dto.terreiroId) data.terreiroId = dto.terreiroId;
    if (dto.instituicaoId) data.instituicaoId = dto.instituicaoId;
    if (dto.imagemUrl) data.imagemUrl = dto.imagemUrl;
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);

    const campanha = await this.prisma.campanhas.create({ data });
    return this.detalhe(campanha.id);
  }

  /**
   * Análise de IA (moderação assistida).
   * IMPORTANTE: resultado é ADVISÓRIO. A decisão final é sempre humana (`aprovar`/`recusar`).
   */
  async analiseIa(id: string, usuarioId: string) {
    const campanha = await this.obter(id);
    const texto = `${campanha.titulo} ${campanha.descricao} ${campanha.historia ?? ''}`;

    const sinaisRisco = [
      'urgente',
      'depósito',
      'deposito',
      'transferência',
      'transferencia',
      'alavancagem',
      'rendimento garantido',
      'recuperação',
      'recuperacao',
    ].filter((t) => texto.toLowerCase().includes(t)).length;

    const score = Math.max(20, Math.min(98, 75 - sinaisRisco * 12));
    const risco = score < 55 ? 'BAIXO' : score < 75 ? 'MEDIO' : 'ALTO';

    const atualizado = await this.prisma.campanhas.update({
      where: { id },
      data: {
        scoreIa: score,
        riscoIa: score,
        detalhesIa: {
          analisadoEm: new Date().toISOString(),
          analisadoPor: usuarioId,
          sinaisEncontrados: sinaisRisco,
          recomendacao:
            risco === 'ALTO'
              ? 'Exigir documentação e revisão humana aprofundada.'
              : 'Ok para revisão humana.',
          aviso: 'Resultado gerado por IA. Nao substitui revisao humana.',
        },
        status: 'EM_ANALISE_IA',
        analisadoIaEm: new Date(),
      },
    });

    return this.detalhe(atualizado.id);
  }

  async aprovar(id: string, usuarioId: string) {
    const campanha = await this.obter(id);
    const nivelVerificacao =
      campanha.nivelVerificacao === 'NAO_VERIFICADA' && campanha.responsavelDocumento
        ? 'VERIFICADA'
        : campanha.nivelVerificacao;

    return this.prisma.campanhas.update({
      where: { id },
      data: {
        status: campanha.cidade ? 'PUBLICADA' : 'APROVADA',
        revisadoPorId: usuarioId,
        aprovadoEm: new Date(),
        publicadoEm: campanha.cidade ? new Date() : null,
        nivelVerificacao,
      },
    });
  }

  async recusar(id: string, usuarioId: string, _motivo?: string) {
    await this.obter(id);
    return this.prisma.campanhas.update({
      where: { id },
      data: { status: 'RECUSADA', revisadoPorId: usuarioId },
    });
  }

  async bloquear(id: string, usuarioId: string) {
    await this.obter(id);
    return this.prisma.campanhas.update({
      where: { id },
      data: { status: 'BLOQUEADA', revisadoPorId: usuarioId },
    });
  }

  async publicar(id: string, usuarioId: string) {
    await this.obter(id);
    return this.prisma.campanhas.update({
      where: { id },
      data: { status: 'PUBLICADA', publicadoEm: new Date(), revisadoPorId: usuarioId },
    });
  }

  async verificar(id: string, nivel: string) {
    await this.obter(id);
    const niveis = ['NAO_VERIFICADA', 'VERIFICADA', 'OFICIAL'];
    if (!niveis.includes(nivel)) throw new BadRequestException('Nível de verificação inválido');
    return this.prisma.campanhas.update({
      where: { id },
      data: { nivelVerificacao: nivel as any },
    });
  }

  async pontuacao(id: string, trustScore: number) {
    await this.obter(id);
    if (typeof trustScore !== 'number' || trustScore < 0 || trustScore > 5) {
      throw new BadRequestException('Trust Score deve estar entre 0 e 5');
    }
    return this.prisma.campanhas.update({
      where: { id },
      data: { trustScore },
    });
  }

  private async obter(id: string) {
    const campanha = await this.prisma.campanhas.findUnique({ where: { id } });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    return campanha;
  }

  private gerarSlug(texto: string) {
    const base = generateSlug(texto, 'campanha').slice(0, 60);
    const rand = Math.random().toString(36).slice(2, 8);
    return `${base}-${rand}`;
  }
}