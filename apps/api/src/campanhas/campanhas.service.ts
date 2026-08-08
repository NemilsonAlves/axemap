import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CampanhasService {
  constructor(private prisma: PrismaService) {}

  async listar(opts: {
    q?: string;
    categoria?: string;
    estado?: string;
    modelo?: string;
    nivel?: string;
    terreiroId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      deletedAt: null,
      status: { in: ['PUBLICADA', 'PRESTACAO_CONTAS', 'ENCERRADA'] },
    };

    if (opts.categoria) where.categoria = opts.categoria;
    if (opts.modelo) where.modeloArrecad = opts.modelo;
    if (opts.nivel) where.nivelVerificacao = opts.nivel;
    if (opts.estado) where.estado = opts.estado;
    if (opts.terreiroId) where.terreiroId = opts.terreiroId;
    if (opts.q) {
      where.OR = [
        { titulo: { contains: opts.q, mode: 'insensitive' } },
        { descricao: { contains: opts.q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.campanhas.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
          instituicao: { select: { id: true, nome: true, slug: true } },
        },
        orderBy: [{ publicadoEm: 'desc' }, { arrecadado: 'desc' }],
        take: Math.min(opts.limit ?? 18, 60),
        skip: opts.offset ?? 0,
      }),
      this.prisma.campanhas.count({ where }),
    ]);

    return { data, total };
  }

  async mapa() {
    const campanhas = await this.prisma.campanhas.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLICADA',
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        titulo: true,
        slug: true,
        categoria: true,
        latitude: true,
        longitude: true,
        cidade: true,
        estado: true,
        metaFinanceira: true,
        arrecadado: true,
        nivelVerificacao: true,
        imagemUrl: true,
        terreiro: { select: { id: true, nome: true, slug: true } },
      },
    });
    return { data: campanhas, total: campanhas.length };
  }

  async instituicoes(limit = 100) {
    const [data, total] = await Promise.all([
      this.prisma.instituicoes.findMany({
        where: { deletedAt: null },
        include: { _count: { select: { campanhas: { where: { deletedAt: null } } } } },
        orderBy: { nome: 'asc' },
        take: Math.min(limit, 200),
      }),
      this.prisma.instituicoes.count({ where: { deletedAt: null } }),
    ]);
    return { data, total };
  }

  async detalhe(slug: string) {
    const campanha = await this.prisma.campanhas.findFirst({
      where: { slug, deletedAt: null },
      include: {
        terreiro: {
          select: { id: true, nome: true, slug: true, cidade: true, estado: true, trustScore: true },
        },
        instituicao: { select: { id: true, nome: true, slug: true, descricao: true, website: true } },
        atualizacoes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { autor: { select: { id: true, nome: true, avatarUrl: true } } },
        },
        prestacoesContas: {
          where: { deletedAt: null },
          orderBy: { data: 'desc' },
          include: {},
        },
      },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    return campanha;
  }

  async apoiar(
    slug: string,
    usuarioId: string,
    dto: { valor: number; mensagem?: string; anonimo?: boolean; recorrencia?: string },
  ) {
    const campanha = await this.prisma.campanhas.findFirst({
      where: { slug, deletedAt: null, status: 'PUBLICADA' },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada ou indisponível para apoio');
    if (!dto.valor || dto.valor <= 0) throw new BadRequestException('Valor de apoio inválido');

    const apoio = await this.prisma.campanhaApoio.create({
      data: {
        campanhaId: campanha.id,
        usuarioId,
        valor: dto.valor,
        mensagem: dto.mensagem?.slice(0, 500) ?? null,
        anonimo: dto.anonimo ?? false,
        recorrencia: dto.recorrencia ?? null,
        status: 'PENDENTE',
      },
    });

    await this.prisma.campanhas.update({
      where: { id: campanha.id },
      data: { apoiadoresCount: { increment: 1 } },
    });

    return apoio;
  }

  async comentar(slug: string, usuarioId: string, dto: { texto: string }) {
    const campanha = await this.prisma.campanhas.findFirst({
      where: { slug, deletedAt: null, status: { in: ['PUBLICADA', 'PRESTACAO_CONTAS', 'ENCERRADA'] } },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');
    if (!dto.texto || !dto.texto.trim()) throw new BadRequestException('Comentário vazio');

    return this.prisma.campanhaComentario.create({
      data: {
        campanhaId: campanha.id,
        usuarioId,
        texto: dto.texto.slice(0, 1000),
      },
      include: { usuario: { select: { id: true, nome: true, avatarUrl: true } } },
    });
  }

  async comentarios(slug: string) {
    const campanha = await this.prisma.campanhas.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    if (!campanha) throw new NotFoundException('Campanha não encontrada');

    const [data, total] = await Promise.all([
      this.prisma.campanhaComentario.findMany({
        where: { campanhaId: campanha.id, deletedAt: null },
        include: { usuario: { select: { id: true, nome: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.campanhaComentario.count({ where: { campanhaId: campanha.id, deletedAt: null } }),
    ]);
    return { data, total };
  }
}