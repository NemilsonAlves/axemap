/**
 * AxéMap ADS — tipos e enums do módulo de publicidade.
 *
 * REGRA ABSOLUTA (Prompt 14, seções 14–16, 41):
 * Pagamento publicitário NUNCA altera:
 * - Trust Score
 * - Verificação / Certificação
 * - Avaliações
 * - Denúncias
 * - Reputação
 * - Posição orgânica no mapa
 *
 * Publicidade altera SOMENTE: exposição publicitária claramente identificada.
 *
 * Todo anúncio publicado deve exibir rótulo: "PATROCINADO" ou "PUBLICIDADE".
 */

export enum AdStatus {
  RASCUNHO = 'RASCUNHO',
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  EM_REVISAO = 'EM_REVISAO',
  APROVADO = 'APROVADO',
  PUBLICADO = 'PUBLICADO',
  PAUSADO = 'PAUSADO',
  ENCERRADO = 'ENCERRADO',
  REJEITADO = 'REJEITADO',
  BLOQUEADO = 'BLOQUEADO',
}

export enum AdPlacement {
  BANNER_HOME = 'BANNER_HOME',
  BANNER_MAPA = 'BANNER_MAPA',
  CARD_PATROCINADO = 'CARD_PATROCINADO',
  EVENTO_PATROCINADO = 'EVENTO_PATROCINADO',
  ORGANIZACAO_PATROCINADORA = 'ORGANIZACAO_PATROCINADORA',
  CONTEUDO_PATROCINADO = 'CONTEUDO_PATROCINADO',
  PAGINA_INSTITUCIONAL = 'PAGINA_INSTITUCIONAL',
  MIDIA_REGIONAL = 'MIDIA_REGIONAL',
  MIDIA_NACIONAL = 'MIDIA_NACIONAL',
  MIDIA_INTERNACIONAL = 'MIDIA_INTERNACIONAL',
}

export enum AdCategory {
  CULTURAL = 'CULTURAL',
  SOCIAL = 'SOCIAL',
  EDUCACIONAL = 'EDUCACIONAL',
  COMERCIAL = 'COMERCIAL',
  INSTITUCIONAL = 'INSTITUCIONAL',
  RELIGIOSO = 'RELIGIOSO',
  EVENTO = 'EVENTO',
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO',
}

export interface CreateAdOrderDto {
  titulo: string;
  descricao?: string;
  destinatarioUrl?: string;
  imagemUrl?: string;
  placement: AdPlacement;
  category: AdCategory;
  /** Localização geográfica para segmentação (opcional). */
  cidadeAlvo?: string;
  estadoAlvo?: string;
  /** Orçamento total em BRL. */
  orcamentoBRL: number;
  dataInicio: string;
  dataFim?: string;
  // anuncianteId é injetado pelo controller via JWT (nunca vem do body do frontend)
}

export interface AdMetrics {
  impressoes: number;
  cliques: number;
  ctr: number;
}
