-- CreateEnum
CREATE TYPE "TaxonomyCategory" AS ENUM ('POVO', 'TRADICAO', 'RELIGIAO', 'ESPALTALIDADE', 'SISTEMA_CONHECIMENTO', 'SISTEMA_ADIVINHACAO', 'EXPRESSAO_CULTURAL', 'LINGUA', 'TERRITORIO', 'REGIAO', 'PAIS', 'DIASPORA', 'COMUNIDADE', 'INSTITUICAO', 'PATRIMONIO', 'EVENTO', 'CONTEUDO');

-- AlterTable (add column with default to backfill existing rows, then drop default)
ALTER TABLE "terreiros" ADD COLUMN "taxonomyCategory" "TaxonomyCategory" NOT NULL DEFAULT 'POVO';
ALTER TABLE "terreiros" ALTER COLUMN "taxonomyCategory" DROP DEFAULT;

ALTER TABLE "organizacoes" ADD COLUMN "taxonomyCategory" "TaxonomyCategory" NOT NULL DEFAULT 'INSTITUICAO';
ALTER TABLE "organizacoes" ALTER COLUMN "taxonomyCategory" DROP DEFAULT;

ALTER TABLE "instituicoes" ADD COLUMN "taxonomyCategory" "TaxonomyCategory" NOT NULL DEFAULT 'INSTITUICAO';
ALTER TABLE "instituicoes" ALTER COLUMN "taxonomyCategory" DROP DEFAULT;

ALTER TABLE "eventos" ADD COLUMN "taxonomyCategory" "TaxonomyCategory" NOT NULL DEFAULT 'EVENTO';
ALTER TABLE "eventos" ALTER COLUMN "taxonomyCategory" DROP DEFAULT;

ALTER TABLE "conteudos" ADD COLUMN "taxonomyCategory" "TaxonomyCategory" NOT NULL DEFAULT 'CONTEUDO';
ALTER TABLE "conteudos" ALTER COLUMN "taxonomyCategory" DROP DEFAULT;