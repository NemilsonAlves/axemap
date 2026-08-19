/**
 * ADS Trust Isolation Spec — AxéMap
 *
 * REGRA ABSOLUTA: Nenhuma operação do módulo ADS pode alterar:
 *  - Trust Score (terreiro ou usuário)
 *  - Status de Verificação
 *  - Status de Certificação
 *  - Posição orgânica no mapa
 *  - Avaliações
 *  - Denúncias
 *
 * Evidência de conformidade: AdsService.aprovar(), AdsService.publicar()
 * apenas atualizam o modelo AdCampanha, sem tocar em Terreiros, Usuarios
 * ou qualquer campo de trust/verificação.
 */

describe('ADS Trust Isolation', () => {
  // ── Mocks ────────────────────────────────────────────────────────────────────
  const mockPrisma: any = {
    adCampanha: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    terreiros: {
      update: jest.fn(),
    },
    usuarios: {
      update: jest.fn(),
    },
  };

  const mockAuditLogs: any = {
    registrar: jest.fn(),
  };

  let service: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Importação dinâmica para evitar acoplamento com NestJS DI nos testes unitários
    const { AdsService } = await import('./ads.service');
    service = new AdsService(mockPrisma, mockAuditLogs);
  });

  // ─────────────────────────────────────────────────────────────────────────────

  it('aprovar um anúncio NÃO deve alterar trust_score do terreiro', async () => {
    mockPrisma.adCampanha.findUnique.mockResolvedValue({
      id: 'ad-1',
      status: 'AGUARDANDO_PAGAMENTO',
      anuncianteId: 'user-1',
    });
    mockPrisma.adCampanha.update.mockResolvedValue({ id: 'ad-1', status: 'APROVADO' });

    await service.aprovar('ad-1', 'admin-1');

    // adCampanha.update deve ter sido chamado
    expect(mockPrisma.adCampanha.update).toHaveBeenCalledTimes(1);
    const updateCall = mockPrisma.adCampanha.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty('trustScore');
    expect(updateCall.data).not.toHaveProperty('trust_score');

    // terreiros e usuarios NÃO devem ter sido tocados
    expect(mockPrisma.terreiros.update).not.toHaveBeenCalled();
    expect(mockPrisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('publicar um anúncio NÃO deve alterar trust_score do terreiro', async () => {
    mockPrisma.adCampanha.findUnique.mockResolvedValue({
      id: 'ad-2',
      status: 'APROVADO',
      anuncianteId: 'user-1',
    });
    mockPrisma.adCampanha.update.mockResolvedValue({ id: 'ad-2', status: 'PUBLICADO' });

    await service.publicar('ad-2', 'admin-1');

    expect(mockPrisma.adCampanha.update).toHaveBeenCalledTimes(1);
    const updateCall = mockPrisma.adCampanha.update.mock.calls[0][0];

    // Campos proibidos na atualização
    expect(updateCall.data).not.toHaveProperty('trustScore');
    expect(updateCall.data).not.toHaveProperty('trust_score');
    expect(updateCall.data).not.toHaveProperty('isVerified');
    expect(updateCall.data).not.toHaveProperty('verificationLevel');
    expect(updateCall.data).not.toHaveProperty('statusVerificacao');

    expect(mockPrisma.terreiros.update).not.toHaveBeenCalled();
    expect(mockPrisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('status de anúncio (PATROCINADO) não deve aparecer em queries orgânicas de mapa', async () => {
    /**
     * Verificação estrutural: a função listarPublicados() não inclui campos
     * de posicionamento orgânico (trustScore, isVerified) no SELECT.
     * A posição orgânica no mapa é determinada exclusivamente por trust_score
     * do terreiro (campo do banco) e NOT por qualquer campo do AdCampanha.
     */
    mockPrisma.adCampanha.findMany = jest.fn().mockResolvedValue([
      {
        id: 'ad-3',
        titulo: 'Anúncio Teste',
        status: 'PUBLICADO',
        placement: 'BANNER_HOME',
        // ads NÃO devem ter trustScore nem posição
      },
    ]);

    const result = await service.listarPublicados('BANNER_HOME');

    // Deve incluir rótulo PATROCINADO
    expect(result[0]).toHaveProperty('rotulo', 'PATROCINADO');

    // Não deve vazar campos de trust/verificação
    expect(result[0]).not.toHaveProperty('trustScore');
    expect(result[0]).not.toHaveProperty('isVerified');
    expect(result[0]).not.toHaveProperty('verificationLevel');
  });

  it('bloquear ou rejeitar um anúncio NÃO deve penalizar o trust score do anunciante', async () => {
    mockPrisma.adCampanha.findUnique.mockResolvedValue({
      id: 'ad-4',
      status: 'AGUARDANDO_PAGAMENTO',
      anuncianteId: 'user-1',
    });
    mockPrisma.adCampanha.update.mockResolvedValue({ id: 'ad-4', status: 'REJEITADO' });

    await service.rejeitar('ad-4', 'admin-1', 'conteúdo inadequado');

    expect(mockPrisma.terreiros.update).not.toHaveBeenCalled();
    expect(mockPrisma.usuarios.update).not.toHaveBeenCalled();
  });
});
