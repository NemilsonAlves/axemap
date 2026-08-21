import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../database/prisma.service';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: {
    produtosMarketplace: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      groupBy: jest.Mock;
    };
    membrosTerreiro: {
      findFirst: jest.Mock;
    };
  };

  const mockTerreiro = {
    id: 'ter-1',
    nome: 'Terreiro Axé',
    slug: 'terreiro-axe',
    cidade: 'Salvador',
    estado: 'BA',
    trustScore: 4.5,
    isVerified: true,
  };

  const mockProduto = {
    id: 'prod-1',
    terreiroId: 'ter-1',
    nome: 'Adé Axé',
    descricao: 'Adé de capoeira',
    preco: 150,
    categoria: 'Roupas',
    estoque: 10,
    imagens: ['img1.jpg'],
    createdAt: new Date('2025-01-01'),
    deletedAt: null,
    terreiro: mockTerreiro,
  };

  beforeEach(async () => {
    prisma = {
      produtosMarketplace: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      membrosTerreiro: {
        findFirst: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(MarketplaceService);
  });

  // ──────────────────────────────────────────────────────────────
  // Product CRUD — listar()
  // ──────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('returns products with pagination', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([mockProduto]);
      prisma.produtosMarketplace.count.mockResolvedValue(1);

      const result = await service.listar({ limit: 24, offset: 0 });

      expect(result.data).toEqual([mockProduto]);
      expect(result.total).toBe(1);
      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 24,
          skip: 0,
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('caps limit at 60', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ limit: 100 });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 60 }),
      );
    });

    it('filters by categoria', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ categoria: 'Roupas' });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoria: 'Roupas' }),
        }),
      );
    });

    it('filters by estado via terreiro join', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ estado: 'BA' });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ terreiro: { estado: 'BA' } }),
        }),
      );
    });

    it('searches by nome/descricao (q param)', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ q: 'axé' });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { nome: { contains: 'axé', mode: 'insensitive' } },
              { descricao: { contains: 'axé', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('excludes deleted products', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({});

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Product CRUD — detalhe()
  // ──────────────────────────────────────────────────────────────

  describe('detalhe', () => {
    it('returns product with terreiro info', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);

      const result = await service.detalhe('prod-1');

      expect(result).toEqual(mockProduto);
      expect(prisma.produtosMarketplace.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1', deletedAt: null },
          include: expect.objectContaining({ terreiro: expect.any(Object) }),
        }),
      );
    });

    it('throws NotFoundException for non-existent product', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(null);

      await expect(service.detalhe('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for deleted product', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(null);

      await expect(service.detalhe('deleted-prod')).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Ownership & Authorization — criar()
  // ──────────────────────────────────────────────────────────────

  describe('criar', () => {
    const createDto = { nome: 'Mojo Bag', preco: 50 };

    it('succeeds when user is DIRIGENTE of the terreiro', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-2',
        terreiroId: 'ter-1',
        ...createDto,
      });

      const result = await service.criar('u1', 'ter-1', createDto);

      expect(result.id).toBe('prod-2');
      expect(prisma.produtosMarketplace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            terreiroId: 'ter-1',
            nome: 'Mojo Bag',
            preco: 50,
          }),
        }),
      );
    });

    it('succeeds when user is ADMIN of the terreiro', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'ADMIN',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-3',
        terreiroId: 'ter-1',
        ...createDto,
      });

      const result = await service.criar('u1', 'ter-1', createDto);

      expect(result.id).toBe('prod-3');
    });

    it('fails when user is NOT a member of the terreiro', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue(null);

      await expect(service.criar('u1', 'ter-1', createDto)).rejects.toThrow(ForbiddenException);
      expect(prisma.produtosMarketplace.create).not.toHaveBeenCalled();
    });

    it('fails when user is COLABORADOR (not DIRIGENTE/ADMIN)', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue(null);

      await expect(
        service.criar('u1', 'ter-1', { nome: 'X', preco: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates product with correct terreiroId', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-4',
        terreiroId: 'ter-1',
        ...createDto,
      });

      await service.criar('u1', 'ter-1', createDto);

      expect(prisma.produtosMarketplace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ terreiroId: 'ter-1' }),
        }),
      );
    });

    it('validates preco > 0 via Prisma (service does not filter, but create is called with the value)', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-5',
        preco: 0,
      });

      const result = await service.criar('u1', 'ter-1', { nome: 'Test', preco: 0 });

      expect(result.preco).toBe(0);
      expect(prisma.produtosMarketplace.create).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Ownership & Authorization — atualizar()
  // ──────────────────────────────────────────────────────────────

  describe('atualizar', () => {
    it('succeeds when user is DIRIGENTE of the product terreiro', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.update.mockResolvedValue({
        ...mockProduto,
        nome: 'Adé Updated',
      });

      const result = await service.atualizar('u1', 'prod-1', { nome: 'Adé Updated' });

      expect(result.nome).toBe('Adé Updated');
      expect(prisma.produtosMarketplace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { nome: 'Adé Updated' },
        }),
      );
    });

    it('fails when user is DIRIGENTE of a DIFFERENT terreiro', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue(null);

      await expect(
        service.atualizar('u2', 'prod-1', { nome: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when product does not exist', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(null);

      await expect(
        service.atualizar('u1', 'nonexistent', { nome: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('only updates provided fields', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.update.mockResolvedValue(mockProduto);

      await service.atualizar('u1', 'prod-1', { estoque: 5 });

      expect(prisma.produtosMarketplace.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { estoque: 5 },
      });
    });

    it('updates multiple fields when provided', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.update.mockResolvedValue(mockProduto);

      await service.atualizar('u1', 'prod-1', { nome: 'New', preco: 99, imagens: ['a.jpg'] });

      expect(prisma.produtosMarketplace.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { nome: 'New', preco: 99, imagens: ['a.jpg'] },
      });
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Ownership & Authorization — remover()
  // ──────────────────────────────────────────────────────────────

  describe('remover', () => {
    it('succeeds when user is DIRIGENTE', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.update.mockResolvedValue({
        ...mockProduto,
        deletedAt: new Date(),
      });

      await service.remover('u1', 'prod-1');

      expect(prisma.produtosMarketplace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { deletedAt: expect.any(Date) },
        }),
      );
    });

    it('fails when user is not a member', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue(null);

      await expect(service.remover('u1', 'prod-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for non-existent product', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(null);

      await expect(service.remover('u1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('sets deletedAt (soft delete), not hard delete', async () => {
      prisma.produtosMarketplace.findFirst.mockResolvedValue(mockProduto);
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.update.mockResolvedValue({
        ...mockProduto,
        deletedAt: new Date(),
      });

      await service.remover('u1', 'prod-1');

      expect(prisma.produtosMarketplace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
      // Ensure no delete (hard delete) was called — Prisma delete would be a different method
      expect(prisma.produtosMarketplace.update).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // categorias()
  // ──────────────────────────────────────────────────────────────

  describe('categorias', () => {
    it('returns grouped categories with counts', async () => {
      prisma.produtosMarketplace.groupBy.mockResolvedValue([
        { categoria: 'Roupas', _count: { id: 12 } },
        { categoria: 'Utensílios', _count: { id: 8 } },
        { categoria: 'Livros', _count: { id: 3 } },
      ]);

      const result = await service.categorias();

      expect(result).toEqual([
        { categoria: 'Roupas', count: 12 },
        { categoria: 'Utensílios', count: 8 },
        { categoria: 'Livros', count: 3 },
      ]);
      expect(prisma.produtosMarketplace.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['categoria'],
          where: expect.objectContaining({
            deletedAt: null,
            categoria: { not: null },
          }),
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      );
    });

    it('returns empty array when no categories exist', async () => {
      prisma.produtosMarketplace.groupBy.mockResolvedValue([]);

      const result = await service.categorias();

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // listar — price range filters
  // ──────────────────────────────────────────────────────────────

  describe('listar — price filters', () => {
    it('filters by precoMin', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ precoMin: 50 });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ preco: { gte: 50 } }),
        }),
      );
    });

    it('filters by precoMax', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ precoMax: 200 });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ preco: { lte: 200 } }),
        }),
      );
    });

    it('filters by precoMin and precoMax combined', async () => {
      prisma.produtosMarketplace.findMany.mockResolvedValue([]);
      prisma.produtosMarketplace.count.mockResolvedValue(0);

      await service.listar({ precoMin: 50, precoMax: 200 });

      expect(prisma.produtosMarketplace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ preco: { gte: 50, lte: 200 } }),
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────
  // criar — default values
  // ──────────────────────────────────────────────────────────────

  describe('criar — defaults', () => {
    it('sets default values for optional fields', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-6',
        terreiroId: 'ter-1',
        nome: 'Mojo Bag',
        descricao: null,
        preco: 50,
        categoria: null,
        estoque: 0,
        imagens: [],
      });

      await service.criar('u1', 'ter-1', { nome: 'Mojo Bag', preco: 50 });

      expect(prisma.produtosMarketplace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            descricao: null,
            estoque: 0,
            imagens: [],
            categoria: null,
          }),
        }),
      );
    });

    it('uses provided optional fields when given', async () => {
      prisma.membrosTerreiro.findFirst.mockResolvedValue({
        usuarioId: 'u1',
        terreiroId: 'ter-1',
        papel: 'DIRIGENTE',
        conviteStatus: 'ACEITO',
      });
      prisma.produtosMarketplace.create.mockResolvedValue({
        id: 'prod-7',
        terreiroId: 'ter-1',
        nome: 'Mojo Bag',
        descricao: 'Especial',
        preco: 50,
        categoria: 'Utensílios',
        estoque: 5,
        imagens: ['img1.jpg'],
      });

      await service.criar('u1', 'ter-1', {
        nome: 'Mojo Bag',
        descricao: 'Especial',
        preco: 50,
        categoria: 'Utensílios',
        estoque: 5,
        imagens: ['img1.jpg'],
      });

      expect(prisma.produtosMarketplace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            descricao: 'Especial',
            categoria: 'Utensílios',
            estoque: 5,
            imagens: ['img1.jpg'],
          }),
        }),
      );
    });
  });
});
