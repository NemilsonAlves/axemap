/**
 * TESTE CRÍTICO: Dinheiro Não Compra Confiança
 *
 * Garante que NENHUMA operação financeira altera:
 * - Trust Score
 * - Verificação / VerificationLevel
 * - Avaliações
 * - Denúncias
 * - Reputação
 * - Posição orgânica
 *
 * Referência: Prompt 14, seções 03, 15, 21, 22, 41, 59.
 */

import { Test } from '@nestjs/testing';
import { ApoieService, NIVEIS_APOIO } from '../../apoie/apoie.service';
import { PrismaService } from '../../database/prisma.service';
import { ApoioNivel, ApoioPeriodicidade, ApoioPlataformaStatus } from '@axemap/shared';

describe('TRUST-MONEY SEPARATION — Dinheiro não compra confiança', () => {
  let apoieService: ApoieService;
  let prisma: any;

  const mockTerreiro = {
    id: 't1',
    trustScore: 3.8,
    isVerified: false,
    verificationLevel: 'BASICO',
  };

  beforeEach(async () => {
    prisma = {
      apoioPlataforma: {
        create: jest.fn().mockResolvedValue({
          id: 'ap1',
          nivel: ApoioNivel.MANTENEDOR,
          valor: 100,
          periodicidade: ApoioPeriodicidade.MENSAL,
          status: ApoioPlataformaStatus.PENDENTE,
          anonimo: false,
          createdAt: new Date(),
        }),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _sum: { valor: 0 }, _count: 0 }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      terreiros: {
        findUnique: jest.fn().mockResolvedValue(mockTerreiro),
        update: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [ApoieService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    apoieService = moduleRef.get(ApoieService);
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA 1: Contribuição de apoio NUNCA altera Trust Score
  // ──────────────────────────────────────────────────────────────

  it('criar apoio MANTENEDOR (R$100/mês) NÃO altera trustScore do terreiro', async () => {
    await apoieService.contribuir('u1', {
      nivel: ApoioNivel.MANTENEDOR,
      periodicidade: ApoioPeriodicidade.MENSAL,
    });

    // GARANTIA: nenhuma chamada de update no modelo terreiros
    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('criar apoio MANTENEDOR NÃO altera isVerified do terreiro', async () => {
    await apoieService.contribuir('u1', { nivel: ApoioNivel.MANTENEDOR });

    const terreiroUpdateCalls = prisma.terreiros.update.mock.calls;
    terreiroUpdateCalls.forEach((call: any[]) => {
      const data = call[0]?.data ?? {};
      expect(data.trustScore).toBeUndefined();
      expect(data.isVerified).toBeUndefined();
      expect(data.verificationLevel).toBeUndefined();
    });
  });

  it('confirmar apoio pelo admin NÃO altera trustScore do apoiador', async () => {
    prisma.apoioPlataforma.findUnique.mockResolvedValue({
      id: 'ap1',
      status: ApoioPlataformaStatus.PENDENTE,
      valor: 100,
      apoiadorId: 'u1',
    });
    prisma.apoioPlataforma.update.mockResolvedValue({
      id: 'ap1',
      status: ApoioPlataformaStatus.CONFIRMADO,
    });

    await apoieService.confirmar('ap1', 'admin1');

    // update de apoio existe (confirmar o pagamento)
    expect(prisma.apoioPlataforma.update).toHaveBeenCalledTimes(1);
    const updateCall = prisma.apoioPlataforma.update.mock.calls[0][0];

    // Mas NÃO deve haver update em usuarios com trustScore
    expect(updateCall?.data?.trustScore).toBeUndefined();
    expect(updateCall?.data?.isVerified).toBeUndefined();
    expect(updateCall?.data?.verificationLevel).toBeUndefined();
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA 2: Os níveis de apoio NÃO conferem hierarquia
  // ──────────────────────────────────────────────────────────────

  it('MANTENEDOR (R$100) NÃO recebe Trust Score maior que SEMENTE (R$5)', () => {
    // Os níveis de apoio são puramente simbólicos/reconhecimento
    // Não existe campo de trustScore nos NIVEIS_APOIO
    NIVEIS_APOIO.forEach((nivel) => {
      expect((nivel as any).trustScore).toBeUndefined();
      expect((nivel as any).trustBoost).toBeUndefined();
      expect((nivel as any).verificationLevel).toBeUndefined();
      expect((nivel as any).isVerified).toBeUndefined();
    });
  });

  it('catálogo de níveis de apoio não contém campos de confiança ou verificação', () => {
    const { data } = apoieService.listarNiveis();

    data.forEach((nivel) => {
      // Verificar que nenhum campo relacionado a Trust está presente
      expect((nivel as any).trustScore).toBeUndefined();
      expect((nivel as any).trustBoost).toBeUndefined();
      expect((nivel as any).verificationLevel).toBeUndefined();
      expect((nivel as any).isVerified).toBeUndefined();
      expect((nivel as any).posicaoOrganica).toBeUndefined();
      expect((nivel as any).removesDenuncias).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA 3: Transparência não expõe dados individuais de anônimos
  // ──────────────────────────────────────────────────────────────

  it('transparência retorna apenas apoiadores NÃO-anônimos no mural', async () => {
    prisma.apoioPlataforma.aggregate.mockResolvedValue({ _sum: { valor: 500 }, _count: 10 });
    prisma.apoioPlataforma.groupBy
      .mockResolvedValueOnce([{ nivel: ApoioNivel.SEMENTE, _sum: { valor: 50 }, _count: { _all: 10 } }])
      .mockResolvedValueOnce([{ apoiadorId: 'u1', _count: { _all: 1 } }]);

    // findMany retorna apenas apoiadores com anonimo: false
    prisma.apoioPlataforma.findMany.mockResolvedValue([
      { nivel: ApoioNivel.SEMENTE, valor: 5, pagoEm: new Date(), apoiador: { nome: 'João' } },
    ]);

    const resultado = await apoieService.transparencia();

    // O mural só deve ter nomes não-anônimos
    resultado.mural.forEach((item) => {
      expect(item.nome).toBeDefined();
      // Não deve expor ID do apoiador
      expect((item as any).apoiadorId).toBeUndefined();
      expect((item as any).id).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA 4: Status de apoio ficam em PENDENTE até confirmação real
  // ──────────────────────────────────────────────────────────────

  it('novo apoio nasce PENDENTE — benefícios não são liberados automaticamente', async () => {
    const resultado = await apoieService.contribuir('u1', { nivel: ApoioNivel.GUARDIAO });
    expect(resultado.status).toBe(ApoioPlataformaStatus.PENDENTE);
  });

  it('apoio com nível MANTENEDOR nasce PENDENTE, não CONFIRMADO', async () => {
    const resultado = await apoieService.contribuir('u1', {
      nivel: ApoioNivel.MANTENEDOR,
      periodicidade: ApoioPeriodicidade.MENSAL,
    });

    const createCall = prisma.apoioPlataforma.create.mock.calls[0][0];
    expect(createCall.data.status).toBe(ApoioPlataformaStatus.PENDENTE);
    expect(resultado.status).toBe(ApoioPlataformaStatus.PENDENTE);
  });
});
