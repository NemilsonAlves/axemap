import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AxegraphService } from './axegraph.service';
import { PrismaService } from '../database/prisma.service';
import {
  GraphEntidadeTipo,
  GraphRelacionamentoTipo,
  GraphStatus,
  DuplicidadeStatus,
} from '@axemap/shared';

describe('AxegraphService', () => {
  let service: AxegraphService;
  let prisma: {
    graphEntidade: { findUnique: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; updateMany: jest.Mock };
    graphRelacionamento: { findUnique: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock };
    graphRelacionamentoHistorico: { create: jest.Mock; findMany: jest.Mock };
    graphCandidatoDuplicidade: { findUnique: jest.Mock; findFirst: jest.Mock; findMany: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  const entidadeTerreiro = {
    id: 'g1',
    entidadeTipo: GraphEntidadeTipo.TERREIRO,
    entidadeId: 't1',
    nome: 'Terreiro Exemplo',
    visivel: true,
    deletedAt: null,
  };
  const entidadeEvento = {
    id: 'g2',
    entidadeTipo: GraphEntidadeTipo.EVENTO,
    entidadeId: 'e1',
    nome: 'Festa de Iemanjá',
    visivel: true,
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      graphEntidade: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
      graphRelacionamento: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      graphRelacionamentoHistorico: { create: jest.fn(), findMany: jest.fn() },
      graphCandidatoDuplicidade: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AxegraphService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(AxegraphService);
  });

  describe('criarRelacionamento', () => {
    it('exige tipo, origemTipo e alvoTipo', async () => {
      await expect(
        service.criarRelacionamento({ origemTipo: undefined as any, origemId: 't1', alvoTipo: undefined as any, alvoId: 'e1', tipo: undefined as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita auto-relacionamento', async () => {
      await expect(
        service.criarRelacionamento({
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 't1',
          alvoTipo: GraphEntidadeTipo.TERREIRO, alvoId: 't1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cria relacionamento PENDENTE para usuário comum', async () => {
      prisma.graphEntidade.findFirst
        .mockResolvedValueOnce(entidadeTerreiro)
        .mockResolvedValueOnce(entidadeEvento);
      prisma.graphRelacionamento.findFirst.mockResolvedValue(null);
      prisma.graphRelacionamento.create.mockResolvedValue({ id: 'r1', tipo: GraphRelacionamentoTipo.REALIZA, status: GraphStatus.PENDENTE, versao: 1 });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      const res = await service.criarRelacionamento(
        {
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 't1',
          alvoTipo: GraphEntidadeTipo.EVENTO, alvoId: 'e1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        },
        'u1',
        false,
      );

      expect(prisma.graphRelacionamento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: GraphStatus.PENDENTE, criadoPorId: 'u1' }),
        }),
      );
      expect(prisma.graphRelacionamentoHistorico.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ acao: 'CRIADO' }) }),
      );
      expect(res.status).toBe(GraphStatus.PENDENTE);
    });

    it('cria relacionamento VERIFICADO quando admin', async () => {
      prisma.graphEntidade.findFirst
        .mockResolvedValueOnce(entidadeTerreiro)
        .mockResolvedValueOnce(entidadeEvento);
      prisma.graphRelacionamento.findFirst.mockResolvedValue(null);
      prisma.graphRelacionamento.create.mockResolvedValue({ id: 'r1', tipo: GraphRelacionamentoTipo.REALIZA, status: GraphStatus.VERIFICADO, versao: 1 });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      const res = await service.criarRelacionamento(
        {
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 't1',
          alvoTipo: GraphEntidadeTipo.EVENTO, alvoId: 'e1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        },
        'admin1',
        true,
      );

      expect(prisma.graphRelacionamento.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: GraphStatus.VERIFICADO }) }),
      );
      expect(res.status).toBe(GraphStatus.VERIFICADO);
    });

    it('reutiliza relacionamento existente e incrementa versão', async () => {
      prisma.graphEntidade.findFirst
        .mockResolvedValueOnce(entidadeTerreiro)
        .mockResolvedValueOnce(entidadeEvento);
      prisma.graphRelacionamento.findFirst.mockResolvedValue({ id: 'r1', versao: 2, status: GraphStatus.REJEITADO });
      prisma.graphRelacionamento.update.mockResolvedValue({ id: 'r1', versao: 3, status: GraphStatus.PENDENTE });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      const res = await service.criarRelacionamento(
        {
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 't1',
          alvoTipo: GraphEntidadeTipo.EVENTO, alvoId: 'e1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        },
        'u1',
        false,
      );

      expect(prisma.graphRelacionamento.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'r1' }, data: expect.objectContaining({ versao: { increment: 1 } }) }),
      );
      expect(prisma.graphRelacionamento.create).not.toHaveBeenCalled();
      expect(prisma.graphRelacionamentoHistorico.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ acao: 'ATUALIZADO' }) }),
      );
      expect(res.status).toBe(GraphStatus.PENDENTE);
    });

    it('lança NotFound quando a origem não existe', async () => {
      prisma.graphEntidade.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.criarRelacionamento({
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 'x',
          alvoTipo: GraphEntidadeTipo.EVENTO, alvoId: 'e1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('bloqueia entidade indisponível', async () => {
      prisma.graphEntidade.findFirst
        .mockResolvedValueOnce({ ...entidadeTerreiro, visivel: false })
        .mockResolvedValueOnce(entidadeEvento);
      await expect(
        service.criarRelacionamento({
          origemTipo: GraphEntidadeTipo.TERREIRO, origemId: 't1',
          alvoTipo: GraphEntidadeTipo.EVENTO, alvoId: 'e1',
          tipo: GraphRelacionamentoTipo.REALIZA,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('revisarRelacionamento', () => {
    it('VERIFICAR aprova e registra histórico', async () => {
      prisma.graphRelacionamento.findUnique.mockResolvedValue({ id: 'r1', status: GraphStatus.PENDENTE, nivelConfianca: 0.3, versao: 1 });
      prisma.graphRelacionamento.update.mockResolvedValue({ id: 'r1', status: GraphStatus.VERIFICADO, versao: 2 });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      const res = await service.revisarRelacionamento('r1', 'VERIFICAR', 'mod1');

      expect(prisma.graphRelacionamento.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'r1' },
          data: expect.objectContaining({
            status: GraphStatus.VERIFICADO,
            verificadoPorId: 'mod1',
            nivelConfianca: expect.any(Number),
            versao: { increment: 1 },
          }),
        }),
      );
      expect(prisma.graphRelacionamentoHistorico.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ acao: 'VERIFICADO' }) }),
      );
      expect(res.status).toBe(GraphStatus.VERIFICADO);
    });

    it('REJEITAR zera confiança', async () => {
      prisma.graphRelacionamento.findUnique.mockResolvedValue({ id: 'r1', status: GraphStatus.PENDENTE, nivelConfianca: 0.7, versao: 1 });
      prisma.graphRelacionamento.update.mockResolvedValue({ id: 'r1', status: GraphStatus.REJEITADO, nivelConfianca: 0, versao: 2 });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      await service.revisarRelacionamento('r1', 'REJEITAR', 'mod1');

      expect(prisma.graphRelacionamento.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: GraphStatus.REJEITADO, nivelConfianca: 0 }) }),
      );
    });

    it('lança NotFound para relacionamento inexistente', async () => {
      prisma.graphRelacionamento.findUnique.mockResolvedValue(null);
      await expect(service.revisarRelacionamento('x', 'VERIFICAR', 'mod1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removerRelacionamento', () => {
    it('soft-delete com registro de histórico', async () => {
      prisma.graphRelacionamento.findUnique.mockResolvedValue({ id: 'r1', status: GraphStatus.VERIFICADO, versao: 2 });
      prisma.graphRelacionamento.update.mockResolvedValue({ id: 'r1', deletedAt: new Date() });
      prisma.graphRelacionamentoHistorico.create.mockResolvedValue({});

      const res = await service.removerRelacionamento('r1', 'u1');

      expect(prisma.graphRelacionamento.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
      expect(prisma.graphRelacionamentoHistorico.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ acao: 'DELETADO' }) }),
      );
      expect(res.ok).toBe(true);
    });
  });

  describe('resolverDuplicidade', () => {
    const dup = {
      id: 'd1',
      entidadeTipo: GraphEntidadeTipo.TERREIRO,
      entidadeIdA: 'a1',
      entidadeIdB: 'b1',
      status: DuplicidadeStatus.ABERTO,
    };

    it('lança Conflict se já resolvida', async () => {
      prisma.graphCandidatoDuplicidade.findUnique.mockResolvedValue({ ...dup, status: DuplicidadeStatus.CONFIRMADO });
      await expect(service.resolverDuplicidade('d1', { decisao: 'CONFIRMAR' }, 'admin1')).rejects.toThrow(ConflictException);
    });

    it('REJEITAR apenas marca como rejeitada', async () => {
      prisma.graphCandidatoDuplicidade.findUnique.mockResolvedValue(dup);
      prisma.graphCandidatoDuplicidade.update.mockResolvedValue({ ...dup, status: DuplicidadeStatus.REJEITADO });

      const res = await service.resolverDuplicidade('d1', { decisao: 'REJEITAR' }, 'admin1');

      expect(prisma.graphCandidatoDuplicidade.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: DuplicidadeStatus.REJEITADO }) }),
      );
      expect(prisma.graphEntidade.updateMany).not.toHaveBeenCalled();
      expect(res.status).toBe(DuplicidadeStatus.REJEITADO);
    });

    it('CONFIRMAR oculta a entidade não-canônica', async () => {
      prisma.graphCandidatoDuplicidade.findUnique.mockResolvedValue(dup);
      prisma.graphCandidatoDuplicidade.update.mockResolvedValue({ ...dup, status: DuplicidadeStatus.CONFIRMADO });
      prisma.graphEntidade.updateMany.mockResolvedValue({ count: 1 });

      const res = await service.resolverDuplicidade('d1', { decisao: 'CONFIRMAR', entidadeCanonicaId: 'a1' }, 'admin1');

      expect(prisma.graphEntidade.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entidadeTipo: GraphEntidadeTipo.TERREIRO, entidadeId: 'b1' }),
          data: expect.objectContaining({ visivel: false }),
        }),
      );
      expect(res.status).toBe(DuplicidadeStatus.CONFIRMADO);
    });
  });

  describe('buscar', () => {
    it('retorna entidade com score quando há correspondência exata', async () => {
      prisma.graphEntidade.findMany.mockResolvedValue([
        { id: 'g1', entidadeTipo: GraphEntidadeTipo.TERREIRO, entidadeId: 't1', nome: 'Terreiro Exemplo', descricaoCurta: null, tags: [], latitude: null, longitude: null, visivel: true, deletedAt: null, _count: { origens: 1, alvos: 0 } },
      ]);
      prisma.graphRelacionamento.findMany.mockResolvedValue([]);

      const res = await service.buscar({ q: 'terreiro exemplo' });

      expect(res.resultados).toHaveLength(1);
      expect(res.resultados[0].entidade.nome).toBe('Terreiro Exemplo');
      expect(res.resultados[0].score).toBeGreaterThan(0);
    });

    it('filtra candidatos sem correspondência', async () => {
      prisma.graphEntidade.findMany.mockResolvedValue([
        { id: 'g1', entidadeTipo: GraphEntidadeTipo.TERREIRO, entidadeId: 't1', nome: 'Igreja Batista', descricaoCurta: null, tags: [], latitude: null, longitude: null, visivel: true, deletedAt: null, _count: { origens: 0, alvos: 0 } },
      ]);

      const res = await service.buscar({ q: 'festa de yemanja' });

      expect(res.resultados).toHaveLength(0);
    });
  });
});
