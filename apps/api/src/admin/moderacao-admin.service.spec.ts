import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModerationAdminService } from './moderacao-admin.service';
import { PrismaService } from '../database/prisma.service';

describe('ModerationAdminService', () => {
  let service: ModerationAdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      eventos: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      organizacoes: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      avaliacoes: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ModerationAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ModerationAdminService);
  });

  describe('listarEventos', () => {
    it('lista apenas eventos ativos por padrão', async () => {
      prisma.eventos.findMany.mockResolvedValue([]);
      prisma.eventos.count.mockResolvedValue(0);

      await service.listarEventos();

      expect(prisma.eventos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
          include: expect.objectContaining({ terreiro: expect.any(Object) }),
        }),
      );
    });

    it('busca por título quando q informado', async () => {
      prisma.eventos.findMany.mockResolvedValue([]);
      prisma.eventos.count.mockResolvedValue(0);

      await service.listarEventos('festa');

      expect(prisma.eventos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            titulo: { contains: 'festa', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('arquivarEvento', () => {
    it('arquiva evento existente', async () => {
      prisma.eventos.findUnique.mockResolvedValue({ id: 'e1', deletedAt: null });
      prisma.eventos.update.mockResolvedValue({ id: 'e1', deletedAt: new Date() });

      await service.arquivarEvento('e1');

      expect(prisma.eventos.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('rejeita evento inexistente', async () => {
      prisma.eventos.findUnique.mockResolvedValue(null);

      await expect(service.arquivarEvento('nao-existe')).rejects.toThrow(NotFoundException);
    });

    it('rejeita evento já arquivado', async () => {
      prisma.eventos.findUnique.mockResolvedValue({ id: 'e1', deletedAt: new Date() });

      await expect(service.arquivarEvento('e1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('publicarOrganizacao', () => {
    it('publica organização e preenche publicadoEm', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ id: 'o1', deletedAt: null, publicadoEm: null });
      prisma.organizacoes.update.mockResolvedValue({ id: 'o1', isPublished: true });

      await service.publicarOrganizacao('o1');

      expect(prisma.organizacoes.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: expect.objectContaining({ isPublished: true, publicadoEm: expect.any(Date) }),
      });
    });

    it('rejeita organização arquivada', async () => {
      prisma.organizacoes.findUnique.mockResolvedValue({ id: 'o1', deletedAt: new Date() });

      await expect(service.publicarOrganizacao('o1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('ocultarAvaliacao', () => {
    it('oculta avaliação existente', async () => {
      prisma.avaliacoes.findUnique.mockResolvedValue({ id: 'a1', deletedAt: null });
      prisma.avaliacoes.update.mockResolvedValue({ id: 'a1', deletedAt: new Date() });

      await service.ocultarAvaliacao('a1');

      expect(prisma.avaliacoes.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
    });

    it('rejeita avaliação já oculta', async () => {
      prisma.avaliacoes.findUnique.mockResolvedValue({ id: 'a1', deletedAt: new Date() });

      await expect(service.ocultarAvaliacao('a1')).rejects.toThrow(BadRequestException);
    });
  });
});
