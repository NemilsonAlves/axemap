import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ApoieService } from './apoie.service';
import { PrismaService } from '../database/prisma.service';
import { ApoioNivel, ApoioPeriodicidade, ApoioPlataformaStatus } from '@axemap/shared';

describe('ApoieService', () => {
  let service: ApoieService;
  let prisma: {
    apoioPlataforma: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      apoioPlataforma: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ApoieService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(ApoieService);
  });

  describe('listarNiveis', () => {
    it('retorna catálogo de 6 níveis com valores fixos', () => {
      const { data, total } = service.listarNiveis();
      expect(total).toBe(6);
      const niveis = data.map((n) => n.nivel);
      expect(niveis).toEqual([
        ApoioNivel.SEMENTE,
        ApoioNivel.GUARDIAO,
        ApoioNivel.AXE,
        ApoioNivel.MEMORIA,
        ApoioNivel.ANCESTRALIDADE,
        ApoioNivel.MANTENEDOR,
      ]);
      expect(data[0].valor).toBe(5);
      expect(data[5].valor).toBe(100);
    });
  });

  describe('contribuir', () => {
    it('rejeita nível inválido', async () => {
      await expect(
        service.contribuir('u1', { nivel: 'OURO' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.apoioPlataforma.create).not.toHaveBeenCalled();
    });

    it('cria apoio PENDENTE e retorna pix de referência', async () => {
      prisma.apoioPlataforma.create.mockResolvedValue({
        id: 'a1',
        nivel: ApoioNivel.GUARDIAO,
        valor: 10,
        periodicidade: ApoioPeriodicidade.AVULSO,
        status: ApoioPlataformaStatus.PENDENTE,
        anonimo: false,
        createdAt: new Date(),
      });

      const resultado = await service.contribuir('u1', { nivel: ApoioNivel.GUARDIAO });

      expect(prisma.apoioPlataforma.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ apoiadorId: 'u1', valor: 10, status: ApoioPlataformaStatus.PENDENTE }),
        }),
      );
      expect(resultado.status).toBe(ApoioPlataformaStatus.PENDENTE);
      expect(resultado.pix).toContain('00020126BR');
    });

    it('suporta apoio mensal e anônimo', async () => {
      prisma.apoioPlataforma.create.mockResolvedValue({
        id: 'a2',
        nivel: ApoioNivel.AXE,
        valor: 15,
        periodicidade: ApoioPeriodicidade.MENSAL,
        status: ApoioPlataformaStatus.PENDENTE,
        anonimo: true,
        createdAt: new Date(),
      });

      await service.contribuir('u1', {
        nivel: ApoioNivel.AXE,
        periodicidade: ApoioPeriodicidade.MENSAL,
        anonimo: true,
      });

      expect(prisma.apoioPlataforma.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ periodicidade: ApoioPeriodicidade.MENSAL, anonimo: true }),
        }),
      );
    });

    it('rejeita mensagem acima de 600 caracteres', async () => {
      await expect(
        service.contribuir('u1', { nivel: ApoioNivel.AXE, mensagem: 'x'.repeat(601) }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transparencia', () => {
    it('retorna agregados sem expor apoiadores anônimos', async () => {
      prisma.apoioPlataforma.aggregate.mockResolvedValue({ _sum: { valor: 125 }, _count: 4 });
      prisma.apoioPlataforma.groupBy
        .mockResolvedValueOnce([
          { nivel: ApoioNivel.GUARDIAO, _sum: { valor: 20 }, _count: { _all: 2 } },
          { nivel: ApoioNivel.AXE, _sum: { valor: 15 }, _count: { _all: 1 } },
        ])
        .mockResolvedValueOnce([{ apoiadorId: 'u1', _count: { _all: 1 } }]);
      prisma.apoioPlataforma.findMany.mockResolvedValue([
        { nivel: ApoioNivel.GUARDIAO, valor: 10, pagoEm: new Date(), apoiador: { nome: 'Mãe Joana' } },
      ]);

      const resultado = await service.transparencia();
      expect(resultado.resumo.totalArrecadado).toBe(125);
      expect(resultado.resumo.totalContribuicoes).toBe(4);
      expect(resultado.resumo.totalApoiadores).toBe(1);
      expect(resultado.porNivel[0].nivel).toBe(ApoioNivel.GUARDIAO);
      expect(resultado.mural[0].nome).toBe('Mãe Joana');
    });
  });

  describe('confirmar / recusar (admin)', () => {
    it('confirma apoio PENDENTE', async () => {
      prisma.apoioPlataforma.findUnique.mockResolvedValue({
        id: 'a1',
        status: ApoioPlataformaStatus.PENDENTE,
        valor: 10,
      });
      prisma.apoioPlataforma.update.mockResolvedValue({
        id: 'a1',
        status: ApoioPlataformaStatus.CONFIRMADO,
        pagoEm: new Date(),
      });

      const resultado = await service.confirmar('a1', 'admin1');
      expect(prisma.apoioPlataforma.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: expect.objectContaining({ status: ApoioPlataformaStatus.CONFIRMADO, confirmadoPorId: 'admin1' }),
        }),
      );
      expect(resultado.status).toBe(ApoioPlataformaStatus.CONFIRMADO);
    });

    it('rejeita confirmar apoio inexistente', async () => {
      prisma.apoioPlataforma.findUnique.mockResolvedValue(null);
      await expect(service.confirmar('a0', 'admin1')).rejects.toThrow(NotFoundException);
    });

    it('rejeita confirmar apoio já processado', async () => {
      prisma.apoioPlataforma.findUnique.mockResolvedValue({
        id: 'a1',
        status: ApoioPlataformaStatus.CONFIRMADO,
      });
      await expect(service.confirmar('a1', 'admin1')).rejects.toThrow(ConflictException);
    });
  });
});
