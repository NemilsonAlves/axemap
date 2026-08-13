-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('RASCUNHO', 'PENDENTE_ANALISE', 'EM_ANALISE_IA', 'AGUARDANDO_DOCUMENTOS', 'EM_REVISAO_HUMANA', 'APROVADA', 'PUBLICADA', 'ENCERRADA', 'PRESTACAO_CONTAS', 'RECUSADA', 'BLOQUEADA', 'ARQUIVADA');

-- CreateEnum
CREATE TYPE "CampaignCategory" AS ENUM ('SOCIAL', 'CULTURAL', 'EDUCACIONAL', 'AMBIENTAL', 'EMERGENCIAL', 'INFRAESTRUTURA', 'PATRIMONIO_HISTORICO', 'PESQUISA', 'JUVENTUDE', 'INCLUSAO', 'EVENTOS');

-- CreateEnum
CREATE TYPE "CampaignFundingModel" AS ENUM ('META_FIXA', 'RECORRENTE', 'EMERGENCIAL');

-- CreateEnum
CREATE TYPE "CampaignVerificationLevel" AS ENUM ('NAO_VERIFICADA', 'VERIFICADA', 'OFICIAL');

-- CreateTable
CREATE TABLE "instituicoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'INSTITUICAO',
    "cnpj" TEXT,
    "descricao" TEXT,
    "cidade" TEXT,
    "estado" VARCHAR(2),
    "website" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,

    CONSTRAINT "instituicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "historia" TEXT,
    "objetivo" TEXT,
    "categoria" "CampaignCategory" NOT NULL,
    "modelo_arrecad" "CampaignFundingModel" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'RASCUNHO',
    "nivel_verificacao" "CampaignVerificationLevel" NOT NULL DEFAULT 'NAO_VERIFICADA',
    "meta_financeira" DOUBLE PRECISION NOT NULL,
    "arrecadado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apoiadores_count" INTEGER NOT NULL DEFAULT 0,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imagem_url" TEXT,
    "imagens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cidade" TEXT,
    "estado" VARCHAR(2),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "responsavel_nome" TEXT,
    "responsavel_documento" TEXT,
    "dados_pagamento" JSONB,
    "plano_uso" TEXT,
    "cronograma" JSONB,
    "risco_ia" DOUBLE PRECISION,
    "score_ia" DOUBLE PRECISION,
    "detalhes_ia" JSONB,
    "analisado_ia_em" TIMESTAMP(3),
    "publicado_em" TIMESTAMP(3),
    "encerrado_em" TIMESTAMP(3),
    "aprovado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,
    "revisado_por_id" TEXT,
    "terreiro_id" TEXT,
    "instituicao_id" TEXT,

    CONSTRAINT "campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_apoios" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "metodo" TEXT,
    "recorrencia" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "mensagem" VARCHAR(500),
    "referencia_gateway" TEXT,
    "pago_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "campanha_id" TEXT NOT NULL,
    "usuario_id" TEXT,

    CONSTRAINT "campanhas_apoios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_atualizacoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ATUALIZACAO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "campanha_id" TEXT NOT NULL,
    "autor_id" TEXT,

    CONSTRAINT "campanhas_atualizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_prestacao_contas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_aplicado" DOUBLE PRECISION,
    "comprovante_url" TEXT,
    "nota_url" TEXT,
    "ano" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "campanha_id" TEXT NOT NULL,

    CONSTRAINT "campanhas_prestacao_contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_comentarios" (
    "id" TEXT NOT NULL,
    "texto" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "campanha_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "campanhas_comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_documentos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "rotulo" TEXT,
    "arquivo_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "campanha_id" TEXT NOT NULL,

    CONSTRAINT "campanhas_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instituicoes_slug_key" ON "instituicoes"("slug");

-- CreateIndex
CREATE INDEX "instituicoes_slug_idx" ON "instituicoes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "campanhas_slug_key" ON "campanhas"("slug");

-- CreateIndex
CREATE INDEX "campanhas_status_created_at_idx" ON "campanhas"("status", "created_at");

-- CreateIndex
CREATE INDEX "campanhas_categoria_status_idx" ON "campanhas"("categoria", "status");

-- CreateIndex
CREATE INDEX "campanhas_slug_idx" ON "campanhas"("slug");

-- CreateIndex
CREATE INDEX "campanhas_apoios_campanha_id_status_idx" ON "campanhas_apoios"("campanha_id", "status");

-- CreateIndex
CREATE INDEX "campanhas_atualizacoes_campanha_id_created_at_idx" ON "campanhas_atualizacoes"("campanha_id", "created_at");

-- CreateIndex
CREATE INDEX "campanhas_prestacao_contas_campanha_id_data_idx" ON "campanhas_prestacao_contas"("campanha_id", "data");

-- CreateIndex
CREATE INDEX "campanhas_comentarios_campanha_id_created_at_idx" ON "campanhas_comentarios"("campanha_id", "created_at");

-- CreateIndex
CREATE INDEX "campanhas_documentos_campanha_id_status_idx" ON "campanhas_documentos"("campanha_id", "status");

-- AddForeignKey
ALTER TABLE "instituicoes" ADD CONSTRAINT "instituicoes_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_revisado_por_id_fkey" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas" ADD CONSTRAINT "campanhas_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_apoios" ADD CONSTRAINT "campanhas_apoios_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_apoios" ADD CONSTRAINT "campanhas_apoios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_atualizacoes" ADD CONSTRAINT "campanhas_atualizacoes_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_atualizacoes" ADD CONSTRAINT "campanhas_atualizacoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_prestacao_contas" ADD CONSTRAINT "campanhas_prestacao_contas_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_comentarios" ADD CONSTRAINT "campanhas_comentarios_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_comentarios" ADD CONSTRAINT "campanhas_comentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_documentos" ADD CONSTRAINT "campanhas_documentos_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanhas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
