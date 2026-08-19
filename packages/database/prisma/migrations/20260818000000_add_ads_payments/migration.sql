-- ============================================================
-- Migration: add_ads_payments
-- Descrição: Módulo AxéMap ADS + Payment Abstraction Layer
-- (Prompt 14, seções 14-16, 27-28, 40-41)
--
-- REGRA ABSOLUTA: Pagamento publicitário NUNCA altera Trust Score,
-- verificação, certificação, posição orgânica, avaliações ou denúncias.
-- Todo anúncio publicado deve exibir rótulo "PATROCINADO".
-- ============================================================

-- Enums de ADS

CREATE TYPE "AdStatus" AS ENUM (
  'RASCUNHO',
  'AGUARDANDO_PAGAMENTO',
  'EM_REVISAO',
  'APROVADO',
  'PUBLICADO',
  'PAUSADO',
  'ENCERRADO',
  'REJEITADO',
  'BLOQUEADO'
);

CREATE TYPE "AdPlacement" AS ENUM (
  'BANNER_HOME',
  'BANNER_MAPA',
  'CARD_PATROCINADO',
  'EVENTO_PATROCINADO',
  'ORGANIZACAO_PATROCINADORA',
  'CONTEUDO_PATROCINADO',
  'PAGINA_INSTITUCIONAL',
  'MIDIA_REGIONAL',
  'MIDIA_NACIONAL',
  'MIDIA_INTERNACIONAL'
);

CREATE TYPE "AdCategory" AS ENUM (
  'CULTURAL',
  'SOCIAL',
  'EDUCACIONAL',
  'COMERCIAL',
  'INSTITUCIONAL',
  'RELIGIOSO',
  'EVENTO',
  'PRODUTO',
  'SERVICO'
);

-- Tabela ad_campanhas
-- Publicidade → Exposição publicitária identificada. Nunca altera Trust.

CREATE TABLE "ad_campanhas" (
  "id"               TEXT         NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "titulo"           TEXT         NOT NULL,
  "descricao"        TEXT,
  "destinatario_url" VARCHAR(1000),
  "imagem_url"       TEXT,
  "placement"        "AdPlacement" NOT NULL,
  "category"         "AdCategory"  NOT NULL,
  "cidade_alvo"      TEXT,
  "estado_alvo"      CHAR(2),
  "orcamento_brl"    DOUBLE PRECISION NOT NULL,
  "status"           "AdStatus"   NOT NULL DEFAULT 'RASCUNHO',
  "motivo_rejeicao"  VARCHAR(500),
  "impressoes"       INTEGER      NOT NULL DEFAULT 0,
  "cliques"          INTEGER      NOT NULL DEFAULT 0,
  "data_inicio"      TIMESTAMP(3) NOT NULL,
  "data_fim"         TIMESTAMP(3),
  "publicado_em"     TIMESTAMP(3),
  "revisado_em"      TIMESTAMP(3),
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL,
  "anunciante_id"    TEXT         NOT NULL,
  "revisado_por_id"  TEXT,

  CONSTRAINT "ad_campanhas_pkey" PRIMARY KEY ("id")
);

-- Tabela ad_pagamentos
-- Pagamento NÃO altera Trust Score nem posição orgânica.

CREATE TABLE "ad_pagamentos" (
  "id"               TEXT         NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "valor"            DOUBLE PRECISION NOT NULL,
  "status"           TEXT         NOT NULL DEFAULT 'PENDENTE',
  "gateway_ref"      TEXT,
  "pago_em"          TIMESTAMP(3),
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL,
  "campanha_id"      TEXT         NOT NULL,
  "confirmado_por_id" TEXT,

  CONSTRAINT "ad_pagamentos_pkey" PRIMARY KEY ("id")
);

-- Tabela payment_webhook_logs
-- Auditoria de webhooks — idempotência e dead-letter

CREATE TABLE "payment_webhook_logs" (
  "id"             TEXT         NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "provider"       TEXT         NOT NULL,
  "gateway_ref"    TEXT         NOT NULL,
  "event_type"     TEXT         NOT NULL,
  "status"         TEXT         NOT NULL,
  "origin"         TEXT         NOT NULL,
  "amount_brl"     DOUBLE PRECISION,
  "raw_payload"    JSONB,
  "processado"     BOOLEAN      NOT NULL DEFAULT false,
  "erro_mensagem"  VARCHAR(500),
  "occurred_at"    TIMESTAMP(3) NOT NULL,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys

ALTER TABLE "ad_campanhas"
  ADD CONSTRAINT "ad_campanhas_anunciante_id_fkey"
    FOREIGN KEY ("anunciante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ad_campanhas"
  ADD CONSTRAINT "ad_campanhas_revisado_por_id_fkey"
    FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ad_pagamentos"
  ADD CONSTRAINT "ad_pagamentos_campanha_id_fkey"
    FOREIGN KEY ("campanha_id") REFERENCES "ad_campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ad_pagamentos"
  ADD CONSTRAINT "ad_pagamentos_confirmado_por_id_fkey"
    FOREIGN KEY ("confirmado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes

CREATE INDEX "ad_campanhas_status_data_inicio_idx" ON "ad_campanhas"("status", "data_inicio");
CREATE INDEX "ad_campanhas_placement_status_idx" ON "ad_campanhas"("placement", "status");
CREATE INDEX "ad_campanhas_anunciante_id_status_idx" ON "ad_campanhas"("anunciante_id", "status");
CREATE INDEX "ad_pagamentos_campanha_id_status_idx" ON "ad_pagamentos"("campanha_id", "status");
CREATE UNIQUE INDEX "payment_webhook_logs_provider_gateway_ref_event_type_key"
  ON "payment_webhook_logs"("provider", "gateway_ref", "event_type");
CREATE INDEX "payment_webhook_logs_processado_created_at_idx" ON "payment_webhook_logs"("processado", "created_at");
CREATE INDEX "payment_webhook_logs_gateway_ref_idx" ON "payment_webhook_logs"("gateway_ref");
