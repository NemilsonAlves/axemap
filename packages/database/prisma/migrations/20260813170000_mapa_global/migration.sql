-- AxéMap Global — preparação para mapa mundial (seção 19)
-- Adiciona "continente" aos Terreiros para filtragem global além do país.

ALTER TABLE "terreiros" ADD COLUMN "continente" VARCHAR(32) NOT NULL DEFAULT 'AMERICA-SUL';