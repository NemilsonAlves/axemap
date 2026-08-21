import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async listar(opts: {
    q?: string;
    categoria?: string;
    estado?: string;
    terreiroId?: string;
    precoMin?: number;
    precoMax?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      deletedAt: null,
    };

    if (opts.categoria) where.categoria = opts.categoria;
    if (opts.terreiroId) where.terreiroId = opts.terreiroId;
    if (opts.precoMin !== undefined) where.preco = { ...where.preco, gte: opts.precoMin };
    if (opts.precoMax !== undefined) where.preco = { ...where.preco, lte: opts.precoMax };

    if (opts.q) {
      where.OR = [
        { nome: { contains: opts.q, mode: 'insensitive' } },
        { descricao: { contains: opts.q, mode: 'insensitive' } },
      ];
    }

    if (opts.estado) {
      where.terreiro = { estado: opts.estado };
    }

    const [data, total] = await Promise.all([
      this.prisma.produtosMarketplace.findMany({
        where,
        include: {
          terreiro: {
            select: { id: true, nome: true, slug: true, cidade: true, estado: true, trustScore: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(opts.limit ?? 24, 60),
        skip: opts.offset ?? 0,
      }),
      this.prisma.produtosMarketplace.count({ where }),
    ]);

    return { data, total };
  }

  async detalhe(id: string) {
    const produto = await this.prisma.produtosMarketplace.findFirst({
      where: { id, deletedAt: null },
      include: {
        terreiro: {
          select: { id: true, nome: true, slug: true, cidade: true, estado: true, trustScore: true, isVerified: true },
        },
      },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async criar(usuarioId: string, terreiroId: string, dto: {
    nome: string;
    descricao?: string;
    preco: number;
    categoria?: string;
    estoque?: number;
    imagens?: string[];
  }) {
    const membro = await this.prisma.membrosTerreiro.findFirst({
      where: { terreiroId, usuarioId, conviteStatus: 'ACEITO', papel: { in: ['DIRIGENTE', 'ADMIN'] } },
    });

    if (!membro) throw new ForbiddenException('Você não tem permissão para criar produtos neste terreiro');

    return this.prisma.produtosMarketplace.create({
      data: {
        terreiroId,
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        preco: dto.preco,
        categoria: dto.categoria ?? null,
        estoque: dto.estoque ?? 0,
        imagens: dto.imagens ?? [],
      },
    });
  }

  async atualizar(usuarioId: string, produtoId: string, dto: {
    nome?: string;
    descricao?: string;
    preco?: number;
    categoria?: string;
    estoque?: number;
    imagens?: string[];
  }) {
    const produto = await this.prisma.produtosMarketplace.findFirst({
      where: { id: produtoId, deletedAt: null },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const membro = await this.prisma.membrosTerreiro.findFirst({
      where: { terreiroId: produto.terreiroId, usuarioId, conviteStatus: 'ACEITO', papel: { in: ['DIRIGENTE', 'ADMIN'] } },
    });
    if (!membro) throw new ForbiddenException('Você não tem permissão para editar este produto');

    const data: Record<string, any> = {};
    if (dto.nome !== undefined) data.nome = dto.nome;
    if (dto.descricao !== undefined) data.descricao = dto.descricao;
    if (dto.preco !== undefined) data.preco = dto.preco;
    if (dto.categoria !== undefined) data.categoria = dto.categoria;
    if (dto.estoque !== undefined) data.estoque = dto.estoque;
    if (dto.imagens !== undefined) data.imagens = dto.imagens;

    return this.prisma.produtosMarketplace.update({
      where: { id: produtoId },
      data,
    });
  }

  async remover(usuarioId: string, produtoId: string) {
    const produto = await this.prisma.produtosMarketplace.findFirst({
      where: { id: produtoId, deletedAt: null },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const membro = await this.prisma.membrosTerreiro.findFirst({
      where: { terreiroId: produto.terreiroId, usuarioId, conviteStatus: 'ACEITO', papel: { in: ['DIRIGENTE', 'ADMIN'] } },
    });
    if (!membro) throw new ForbiddenException('Você não tem permissão para remover este produto');

    return this.prisma.produtosMarketplace.update({
      where: { id: produtoId },
      data: { deletedAt: new Date() },
    });
  }

  async categorias() {
    const result = await this.prisma.produtosMarketplace.groupBy({
      by: ['categoria'],
      where: { deletedAt: null, categoria: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    return result.map((r) => ({ categoria: r.categoria, count: r._count.id }));
  }
}
