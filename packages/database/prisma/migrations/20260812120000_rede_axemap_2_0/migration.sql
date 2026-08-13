-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('FEDERACAO', 'CONFEDERACAO', 'ASSOCIACAO', 'INSTITUTO', 'UNIVERSIDADE', 'MUSEU', 'CENTRO_CULTURAL', 'PROJETO_SOCIAL', 'DEFESA_LIBERDADE_RELIGIOSA', 'PARCEIRO', 'COMUNIDADE');

-- CreateEnum
CREATE TYPE "OrganizationVerificationLevel" AS ENUM ('NAO_VERIFICADA', 'REIVINDICADA', 'VERIFICADA', 'ORGANIZACAO_VERIFICADA', 'PARCEIRO_INSTITUCIONAL');

-- CreateEnum
CREATE TYPE "OrgRelationshipStatus" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'REMOVIDA');

-- CreateEnum
CREATE TYPE "RegiaoTipo" AS ENUM ('CONTINENTE', 'PAIS', 'REGIAO', 'TERRITORIO');

-- AlterTable
ALTER TABLE "terreiros" ADD COLUMN     "pais" VARCHAR(2) NOT NULL DEFAULT 'BR';

-- CreateTable
CREATE TABLE "organizacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_publico" TEXT,
    "slug" TEXT NOT NULL,
    "tipo" "OrganizationType" NOT NULL DEFAULT 'ASSOCIACAO',
    "pais" VARCHAR(2) NOT NULL DEFAULT 'BR',
    "estado" VARCHAR(2),
    "cidade" TEXT,
    "website" TEXT,
    "redesSociais" JSONB,
    "descricao" TEXT,
    "historia" TEXT,
    "tradicoes" TEXT[],
    "ano_fundacao" INTEGER,
    "area_atuacao" TEXT,
    "num_organizacoes_associadas" INTEGER NOT NULL DEFAULT 0,
    "contatos" JSONB,
    "verificacao" "OrganizationVerificationLevel" NOT NULL DEFAULT 'NAO_VERIFICADA',
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "publicado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,

    CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizacao_relacionamentos" (
    "id" TEXT NOT NULL,
    "status" "OrgRelationshipStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "terreiroId" TEXT NOT NULL,

    CONSTRAINT "organizacao_relacionamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regioes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "RegiaoTipo" NOT NULL,
    "ordenacao" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "regioes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiao_tradicoes" (
    "id" TEXT NOT NULL,
    "tradicao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regiaoId" TEXT NOT NULL,

    CONSTRAINT "regiao_tradicoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizacoes_slug_key" ON "organizacoes"("slug");

-- CreateIndex
CREATE INDEX "organizacoes_tipo_pais_idx" ON "organizacoes"("tipo", "pais");

-- CreateIndex
CREATE INDEX "organizacoes_trust_score_idx" ON "organizacoes"("trust_score");

-- CreateIndex
CREATE UNIQUE INDEX "organizacao_relacionamentos_organizacaoId_terreiroId_key" ON "organizacao_relacionamentos"("organizacaoId", "terreiroId");

-- CreateIndex
CREATE UNIQUE INDEX "regioes_slug_key" ON "regioes"("slug");

-- CreateIndex
CREATE INDEX "regioes_tipo_idx" ON "regioes"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "regiao_tradicoes_regiaoId_tradicao_key" ON "regiao_tradicoes"("regiaoId", "tradicao");

-- AddForeignKey
ALTER TABLE "organizacoes" ADD CONSTRAINT "organizacoes_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacao_relacionamentos" ADD CONSTRAINT "organizacao_relacionamentos_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizacao_relacionamentos" ADD CONSTRAINT "organizacao_relacionamentos_terreiroId_fkey" FOREIGN KEY ("terreiroId") REFERENCES "terreiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regioes" ADD CONSTRAINT "regioes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "regioes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regiao_tradicoes" ADD CONSTRAINT "regiao_tradicoes_regiaoId_fkey" FOREIGN KEY ("regiaoId") REFERENCES "regioes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

