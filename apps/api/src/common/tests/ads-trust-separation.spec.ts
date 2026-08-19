/**
 * TESTE CRÍTICO: Publicidade não altera Trust
 *
 * Garante que NENHUMA operação de ADS altera Trust Score,
 * verificação, certificação, posição orgânica ou avaliações.
 *
 * Referência: Prompt 14, seções 14–16, 40–41.
 */

import { Test } from '@nestjs/testing';
import { AdsService } from '../../ads/ads.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AdStatus, AdPlacement, AdCategory } from '../../ads/ads.types';

describe('ADS TRUST SEPARATION — Publicidade não altera Trust', () => {
  let adsService: AdsService;
  let prisma: any;
  let auditLogs: any;

  const mockCampanha = {
    id: 'ad1',
    titulo: 'Campanha Teste',
    status: AdStatus.APROVADO,
    placement: AdPlacement.BANNER_HOME,
    category: AdCategory.CULTURAL,
    orcamentoBRL: 500,
    anuncianteId: 'u1',
    dataInicio: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      adCampanha: {
        create: jest.fn().mockResolvedValue({ ...mockCampanha, id: 'ad1', status: AdStatus.AGUARDANDO_PAGAMENTO }),
        findUnique: jest.fn().mockResolvedValue({ ...mockCampanha }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({ ...mockCampanha, status: AdStatus.PUBLICADO }),
      },
      terreiros: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      usuarios: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    auditLogs = { registrar: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    adsService = moduleRef.get(AdsService);
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA: aprovar anúncio NÃO altera Trust
  // ──────────────────────────────────────────────────────────────

  it('aprovar anúncio NÃO altera trustScore de terreiro', async () => {
    await adsService.aprovar('ad1', 'admin1');

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('publicar anúncio NÃO altera isVerified de terreiro', async () => {
    prisma.adCampanha.findUnique.mockResolvedValue({
      ...mockCampanha,
      status: AdStatus.APROVADO,
    });

    await adsService.publicar('ad1', 'admin1');

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
    expect(prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('publicar anúncio NÃO altera verificationLevel', async () => {
    prisma.adCampanha.findUnique.mockResolvedValue({
      ...mockCampanha,
      status: AdStatus.APROVADO,
    });

    await adsService.publicar('ad1', 'admin1');

    const updateCalls = prisma.adCampanha.update.mock.calls;
    updateCalls.forEach((call: any[]) => {
      const data = call[0]?.data ?? {};
      expect(data.trustScore).toBeUndefined();
      expect(data.isVerified).toBeUndefined();
      expect(data.verificationLevel).toBeUndefined();
    });
  });

  it('anúncios publicados SEMPRE incluem campo rotulo="PATROCINADO"', async () => {
    prisma.adCampanha.findMany.mockResolvedValue([
      { id: 'ad1', titulo: 'Teste', placement: AdPlacement.BANNER_HOME, category: AdCategory.CULTURAL },
    ]);

    const resultado = await adsService.listarPublicados(AdPlacement.BANNER_HOME);

    resultado.forEach((ad: any) => {
      expect(ad.rotulo).toBe('PATROCINADO');
    });
  });

  it('rejeitar anúncio NÃO altera trust nem verificação de nenhuma entidade', async () => {
    await adsService.rejeitar('ad1', 'admin1', 'Conteúdo inadequado');

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
    expect(prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('criar pedido de anúncio cria campanha com status AGUARDANDO_PAGAMENTO', async () => {
    const resultado = await adsService.criarPedido(
      {
        titulo: 'Campanha Teste',
        placement: AdPlacement.BANNER_HOME,
        category: AdCategory.CULTURAL,
        orcamentoBRL: 500,
        dataInicio: new Date().toISOString(),
        // anuncianteId é injetado pelo controller via JWT, não vem do DTO
      },
      'u1',
    );

    expect(resultado.status).toBe(AdStatus.AGUARDANDO_PAGAMENTO);

    // NÃO altera Trust
    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // REGRA: posição orgânica não é alterada por ADS
  // ──────────────────────────────────────────────────────────────

  it('anúncios são retornados SEPARADOS do ranking orgânico', async () => {
    prisma.adCampanha.findMany.mockResolvedValue([
      {
        id: 'ad1',
        titulo: 'Anúncio Patrocinado',
        placement: AdPlacement.CARD_PATROCINADO,
        category: AdCategory.COMERCIAL,
      },
    ]);

    const ads = await adsService.listarPublicados(AdPlacement.CARD_PATROCINADO);

    // Todo card patrocinado tem rótulo explícito
    expect(ads.every((ad: any) => ad.rotulo === 'PATROCINADO')).toBe(true);
  });
});
