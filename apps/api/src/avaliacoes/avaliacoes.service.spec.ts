import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { PrismaService } from '../database/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

describe('AvaliacoesService', () => {
  let service: AvaliacoesService;
  let notificacoes: { criar: jest.Mock };
  let prisma: {
    terreiros: { findFirst: jest.Mock; findUnique: jest.Mock };
    avaliacoes: {
      upsert: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    avaliacaoResposta: { upsert: jest.Mock };
  };

  const mockTerreiro = { id: 't1', deletedAt: null, dirigenteId: 'dirigente1' };

  beforeEach(async () => {
    prisma = {
      terreiros: { findFirst: jest.fn(), findUnique: jest.fn() },
      avaliacoes: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      avaliacaoResposta: { upsert: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AvaliacoesService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificacoesService, useValue: { criar: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(AvaliacoesService);
    notificacoes = moduleRef.get(NotificacoesService);
  });

  describe('criar', () => {
    it('valida nota fora do intervalo 1-5', async () => {
      await expect(service.criar('u1', { terreiroId: 't1', nota: 6 }))
        .rejects.toThrow(BadRequestException);
    });

    it('lança NotFoundException quando o terreiro não existe', async () => {
      prisma.terreiros.findFirst.mockResolvedValue(null);
      await expect(service.criar('u1', { terreiroId: 'x', nota: 5 }))
        .rejects.toThrow(NotFoundException);
    });

    it('cria avaliação com upsert (um por usuário/terreiro)', async () => {
      prisma.terreiros.findFirst.mockResolvedValue(mockTerreiro);
      prisma.avaliacoes.upsert.mockResolvedValue({ id: 'a1', nota: 5, resposta: null });

      const result = await service.criar('u1', { terreiroId: 't1', nota: 5, texto: 'ótimo' });

      expect(prisma.avaliacoes.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId_terreiroId: { usuarioId: 'u1', terreiroId: 't1' } },
          create: expect.objectContaining({ nota: 5 }),
          update: expect.objectContaining({ nota: 5 }),
        }),
      );
      expect(result.id).toBe('a1');
    });
  });

  describe('responder', () => {
    it('permite apenas o dirigente do terreiro', async () => {
      prisma.avaliacoes.findFirst.mockResolvedValue({ id: 'a1', terreiroId: 't1', usuarioId: 'u1', deletedAt: null });
      prisma.terreiros.findUnique.mockResolvedValue({ dirigenteId: 'outro' });

      await expect(service.responder('naoDirigente', 'a1', 'resposta'))
        .rejects.toThrow(ForbiddenException);
    });

    it('registra a resposta do dirigente', async () => {
      prisma.avaliacoes.findFirst.mockResolvedValue({ id: 'a1', terreiroId: 't1', usuarioId: 'u1', deletedAt: null });
      prisma.terreiros.findUnique.mockResolvedValue({ dirigenteId: 'dirigente1' });
      prisma.avaliacaoResposta.upsert.mockResolvedValue({ id: 'r1', texto: 'obrigado' });

      const result = await service.responder('dirigente1', 'a1', 'obrigado');

      expect(prisma.avaliacaoResposta.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { avaliacaoId: 'a1' } }),
      );
      expect(notificacoes.criar).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ tipo: 'AVALIACAO_RESPONDIDA' }),
      );
      expect(result.texto).toBe('obrigado');
    });
  });

  describe('remover', () => {
    it('soft-delete apenas a própria avaliação', async () => {
      prisma.avaliacoes.findFirst.mockResolvedValue({ id: 'a1', usuarioId: 'u1', deletedAt: null });
      prisma.avaliacoes.update.mockResolvedValue({ id: 'a1', deletedAt: new Date() });

      await service.remover('u1', 'a1');

      expect(prisma.avaliacoes.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
      );
    });

    it('bloqueia remoção de avaliação de outro usuário', async () => {
      prisma.avaliacoes.findFirst.mockResolvedValue({ id: 'a1', usuarioId: 'outro', deletedAt: null });

      await expect(service.remover('u1', 'a1')).rejects.toThrow(ForbiddenException);
    });
  });
});
