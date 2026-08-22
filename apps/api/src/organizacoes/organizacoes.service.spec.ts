import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrganizacoesService } from './organizacoes.service';
import { PrismaService } from '../database/prisma.service';

describe('OrganizacoesService', () => {
  let service: OrganizacoesService;
  let prisma: any;

  const mockOrg = {
    id: 'org-1',
    nome: 'Federacao Teste',
    nomePublico: null,
    slug: 'federacao-teste',
    tipo: 'FEDERACAO',
    pais: 'BR',
    estado: 'BA',
    cidade: 'Salvador',
    website: null,
    descricao: null,
    historia: null,
    tradicoes: [],
    anoFundacao: null,
    areaAtuacao: null,
    numOrganizacoesAssociadas: 0,
    verificacao: 'NAO',
    trustScore: 0,
    isPublished: false,
    publicadoEm: null,
    criadoPorId: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      organizacoes: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      organizacaoRelacionamentos: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      terreiros: {
        findUnique: jest.fn(),
      },
      regioes: {
        findMany: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizacoesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(OrganizacoesService);
  });

  describe('listar', () => {
    it('returns paginated results', async () => {
      prisma.organizacoes.count.mockResolvedValue(1);
      prisma.organizacoes.findMany.mockResolvedValue([mockOrg]);

      const result = await service.listar({ limit: 10, offset: 0 });

      expect(result).toEqual({ total: 1, items: [mockOrg] });
      expect(prisma.organizacoes.count).toHaveBeenCalledWith({
        where: { deletedAt: null, isPublished: true },
      });
    });

    it('filters by tipo', async () => {
      prisma.organizacoes.count.mockResolvedValue(0);
      prisma.organizacoes.findMany.mockResolvedValue([]);

      await service.listar({ tipo: 'FEDERACAO', limit: 10, offset: 0 });

      expect(prisma.organizacoes.count).toHaveBeenCalledWith({
        where: { deletedAt: null, isPublished: true, tipo: 'FEDERACAO' },
      });
    });

    it('filters by search query', async () => {
      prisma.organizacoes.count.mockResolvedValue(0);
      prisma.organizacoes.findMany.mockResolvedValue([]);

      await service.listar({ q: 'salvador', limit: 10, offset: 0 });

      const whereCall = prisma.organizacoes.count.mock.calls[0][0].where;
      expect(whereCall.OR).toHaveLength(3);
    });
  });

  describe('detalhe', () => {
    it('throws NotFoundException for missing org', async () => {
      prisma.organizacoes.findFirst.mockResolvedValue(null);

      await expect(service.detalhe('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('returns org with comunidades', async () => {
      prisma.organizacoes.findFirst.mockResolvedValue(mockOrg);
      prisma.organizacaoRelacionamentos.findMany.mockResolvedValue([]);

      const result = await service.detalhe('federacao-teste');

      expect(result.id).toBe('org-1');
      expect(result.comunidades).toEqual([]);
    });
  });

  describe('criar', () => {
    it('throws BadRequestException if nome missing', async () => {
      await expect(service.criar('user-1', { tipo: 'FEDERACAO' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if tipo missing', async () => {
      await expect(service.criar('user-1', { nome: 'Teste' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates org with slug', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(null);
      prisma.organizacoes.create.mockResolvedValue(mockOrg);

      const result = await service.criar('user-1', {
        nome: 'Federacao Teste',
        tipo: 'FEDERACAO',
      });

      expect(result).toEqual(mockOrg);
      expect(prisma.organizacoes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nome: 'Federacao Teste',
            tipo: 'FEDERACAO',
            criadoPorId: 'user-1',
          }),
        }),
      );
    });

    it('appends timestamp to slug if duplicate', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ id: 'existing' });
      prisma.organizacoes.create.mockResolvedValue(mockOrg);

      await service.criar('user-1', {
        nome: 'Federacao Teste',
        tipo: 'FEDERACAO',
      });

      const createCall = prisma.organizacoes.create.mock.calls[0][0];
      expect(createCall.data.slug).toMatch(/^federacao-teste-[a-z0-9]+$/);
    });
  });

  describe('atualizar', () => {
    it('throws NotFoundException for missing org', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(null);

      await expect(service.atualizar('user-1', 'nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if not owner or admin', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ ...mockOrg, criadoPorId: 'other' });

      await expect(service.atualizar('user-1', 'org-1', { nome: 'Novo' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows owner to update', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(mockOrg);
      prisma.organizacoes.update.mockResolvedValue({ ...mockOrg, nome: 'Novo' });

      const result = await service.atualizar('user-1', 'org-1', { nome: 'Novo' });

      expect(result.nome).toBe('Novo');
    });

    it('allows admin to update any org', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ ...mockOrg, criadoPorId: 'other' });
      prisma.organizacoes.update.mockResolvedValue({ ...mockOrg, nome: 'Admin Update' });

      const result = await service.atualizar('admin', 'org-1', { nome: 'Admin Update' }, true);

      expect(result.nome).toBe('Admin Update');
    });
  });

  describe('publicar', () => {
    it('sets isPublished and publicadoEm', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(mockOrg);
      prisma.organizacoes.update.mockResolvedValue({ ...mockOrg, isPublished: true });

      await service.publicar('user-1', 'org-1');

      expect(prisma.organizacoes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'org-1' },
          data: { isPublished: true, publicadoEm: expect.any(Date) },
        }),
      );
    });
  });

  describe('solicitarVinculo', () => {
    it('throws NotFoundException for missing org', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(null);

      await expect(service.solicitarVinculo('user-1', 'nonexistent', 'ter-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if not owner', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ ...mockOrg, criadoPorId: 'other' });

      await expect(service.solicitarVinculo('user-1', 'org-1', 'ter-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws if terreiro not found', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(mockOrg);
      prisma.terreiros.findUnique.mockResolvedValue(null);

      await expect(service.solicitarVinculo('user-1', 'org-1', 'ter-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws if vinculo already exists', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(mockOrg);
      prisma.terreiros.findUnique.mockResolvedValue({ id: 'ter-1' });
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue({ id: 'rel-1' });

      await expect(service.solicitarVinculo('user-1', 'org-1', 'ter-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates PENDENTE relationship', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue(mockOrg);
      prisma.terreiros.findUnique.mockResolvedValue({ id: 'ter-1' });
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue(null);
      prisma.organizacaoRelacionamentos.create.mockResolvedValue({
        id: 'rel-1',
        status: 'PENDENTE',
      });

      const result = await service.solicitarVinculo('user-1', 'org-1', 'ter-1');

      expect(result.status).toBe('PENDENTE');
    });
  });

  describe('aceitarVinculo', () => {
    it('throws if vinculo not found', async () => {
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue(null);

      await expect(service.aceitarVinculo('user-1', 'org-1', 'rel-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws if user is not terreiro dirigente', async () => {
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue({
        id: 'rel-1',
        organizacaoId: 'org-1',
        terreiro: { dirigenteId: 'other' },
        organizacao: mockOrg,
      });

      await expect(service.aceitarVinculo('user-1', 'org-1', 'rel-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('accepts vinculo and increments counter', async () => {
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue({
        id: 'rel-1',
        organizacaoId: 'org-1',
        terreiro: { dirigenteId: 'user-1' },
        organizacao: mockOrg,
      });
      prisma.organizacaoRelacionamentos.update.mockResolvedValue({
        id: 'rel-1',
        status: 'ACEITA',
      });
      prisma.organizacoes.update.mockResolvedValue({});

      const result = await service.aceitarVinculo('user-1', 'org-1', 'rel-1');

      expect(result.status).toBe('ACEITA');
      expect(prisma.organizacoes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'org-1' },
          data: { numOrganizacoesAssociadas: { increment: 1 } },
        }),
      );
    });
  });

  describe('recusarVinculo', () => {
    it('throws if vinculo not found', async () => {
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue(null);

      await expect(service.recusarVinculo('user-1', 'org-1', 'rel-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('recusa vinculo', async () => {
      prisma.organizacaoRelacionamentos.findUnique.mockResolvedValue({
        id: 'rel-1',
        organizacaoId: 'org-1',
        terreiroId: 'ter-1',
      });
      prisma.terreiros.findUnique.mockResolvedValue({ dirigenteId: 'user-1' });
      prisma.organizacaoRelacionamentos.update.mockResolvedValue({
        id: 'rel-1',
        status: 'RECUSADA',
      });

      const result = await service.recusarVinculo('user-1', 'org-1', 'rel-1');

      expect(result.status).toBe('RECUSADA');
    });
  });
});
