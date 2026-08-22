import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/** Comissão padrão AxéMap Marketplace (configurável pelo admin no futuro). */
const COMISSAO_PERCENT_DEFAULT = 10;

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  private slugificar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

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
    precoPromocional?: number;
    categoria?: string;
    estoque?: number;
    imagens?: string[];
  }) {
    const membro = await this.prisma.membrosTerreiro.findFirst({
      where: { terreiroId, usuarioId, conviteStatus: 'ACEITO', papel: { in: ['DIRIGENTE', 'ADMIN'] } },
    });

    if (!membro) throw new ForbiddenException('Você não tem permissão para criar produtos neste terreiro');

    const slugBase = this.slugificar(dto.nome);
    const exists = await this.prisma.produtosMarketplace.findUnique({ where: { slug: slugBase } });
    const slug = exists ? `${slugBase}-${Date.now().toString(36)}` : slugBase;

    return this.prisma.produtosMarketplace.create({
      data: {
        terreiroId,
        nome: dto.nome,
        slug,
        descricao: dto.descricao ?? null,
        preco: dto.preco,
        precoPromocional: dto.precoPromocional ?? null,
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

  // ──────────────────────────────────────────────────────────────
  // PEDIDOS
  // ──────────────────────────────────────────────────────────────

  async criarPedido(usuarioId: string, dto: {
    itens: { produtoId: string; quantidade: number }[];
    observacoes?: string;
  }) {
    if (!dto.itens || dto.itens.length === 0) {
      throw new BadRequestException('Pedido deve conter pelo menos um item');
    }

    // Buscar produtos e validar
    const produtoIds = dto.itens.map((i) => i.produtoId);
    const produtos = await this.prisma.produtosMarketplace.findMany({
      where: { id: { in: produtoIds }, deletedAt: null },
      include: { terreiro: { select: { id: true } } },
    });

    if (produtos.length !== produtoIds.length) {
      throw new BadRequestException('Um ou mais produtos não foram encontrados');
    }

    // Verificar estoque
    for (const item of dto.itens) {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) throw new BadRequestException(`Produto ${item.produtoId} não encontrado`);
      if (produto.estoque < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para ${produto.nome}`);
      }
    }

    // Verificar que todos os produtos são do mesmo terreiro
    const terreiroIds = [...new Set(produtos.map((p) => p.terreiroId))];
    if (terreiroIds.length > 1) {
      throw new BadRequestException('Todos os itens devem ser do mesmo terreiro');
    }

    const terreiroId = terreiroIds[0];

    // Calcular valores
    let subtotal = 0;
    const itensData = dto.itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)!;
      const precoUnitario = produto.precoPromocional ?? produto.preco;
      const itemSubtotal = precoUnitario * item.quantidade;
      subtotal += itemSubtotal;
      return {
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario,
        subtotal: itemSubtotal,
      };
    });

    const comissaoPercent = COMISSAO_PERCENT_DEFAULT;
    const comissaoValor = Math.round(subtotal * comissaoPercent / 100 * 100) / 100;
    const total = Math.round((subtotal + comissaoValor) * 100) / 100;

    // Criar pedido com itens
    const pedido = await this.prisma.$transaction(async (tx) => {
      const p = await tx.pedidosMarketplace.create({
        data: {
          compradorId: usuarioId,
          terreiroId,
          subtotal,
          comissaoPercent,
          comissaoValor,
          total,
          observacoes: dto.observacoes ?? null,
          itens: {
            create: itensData,
          },
        },
        include: {
          itens: { include: { produto: { select: { id: true, nome: true } } } },
          terreiro: { select: { id: true, nome: true, slug: true } },
        },
      });

      // Decrementar estoque
      for (const item of dto.itens) {
        await tx.produtosMarketplace.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } },
        });
      }

      return p;
    });

    return pedido;
  }

  async detalhePedido(pedidoId: string, usuarioId: string) {
    const pedido = await this.prisma.pedidosMarketplace.findUnique({
      where: { id: pedidoId },
      include: {
        itens: { include: { produto: { select: { id: true, nome: true, imagens: true } } } },
        terreiro: { select: { id: true, nome: true, slug: true } },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    if (pedido.compradorId !== usuarioId) throw new ForbiddenException('Acesso negado');
    return pedido;
  }

  async meusPedidos(usuarioId: string, limit = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.pedidosMarketplace.findMany({
        where: { compradorId: usuarioId },
        include: {
          itens: { select: { quantidade: true, subtotal: true } },
          terreiro: { select: { nome: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 50),
        skip: offset,
      }),
      this.prisma.pedidosMarketplace.count({ where: { compradorId: usuarioId } }),
    ]);
    return { data, total };
  }

  async confirmarPagamento(pedidoId: string, gatewayRef: string) {
    const pedido = await this.prisma.pedidosMarketplace.findUnique({ where: { id: pedidoId } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    if (pedido.status !== 'CRIADO') throw new BadRequestException('Pedido já processado');

    return this.prisma.pedidosMarketplace.update({
      where: { id: pedidoId },
      data: { status: 'PAGO', gatewayRef },
    });
  }
}
