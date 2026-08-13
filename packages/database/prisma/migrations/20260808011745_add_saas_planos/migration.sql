-- CreateEnum
CREATE TYPE "PlanoCiclo" AS ENUM ('MENSAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "PlanoAssinaturaStatus" AS ENUM ('PENDENTE', 'ATIVO', 'ATRASADO', 'EXPIRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PlanoPagamentoMetodo" AS ENUM ('PIX', 'CARTAO', 'BOLETO');

-- CreateEnum
CREATE TYPE "PlanoPagamentoStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHADO', 'REEMBOLSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TransacaoTipo" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "TransacaoOrigem" AS ENUM ('PIX', 'DOACAO', 'MENSALIDADE', 'VENDA', 'TAXA_EVENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "PixChaveTipo" AS ENUM ('CPF', 'CNPJ', 'TELEFONE', 'EMAIL', 'ALEATORIA');

-- CreateTable
CREATE TABLE "planos_saas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco_mensal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preco_anual" DOUBLE PRECISION,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "funcionalidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "limites" JSONB,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_saas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_assinaturas" (
    "id" TEXT NOT NULL,
    "status" "PlanoAssinaturaStatus" NOT NULL DEFAULT 'PENDENTE',
    "ciclo" "PlanoCiclo" NOT NULL DEFAULT 'MENSAL',
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renovar_em" TIMESTAMP(3),
    "cancelado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "plano_id" TEXT NOT NULL,

    CONSTRAINT "plano_assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_pagamentos" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" "PlanoPagamentoMetodo" NOT NULL DEFAULT 'PIX',
    "status" "PlanoPagamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "referencia" TEXT,
    "gateway_ref" TEXT,
    "pago_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assinatura_id" TEXT NOT NULL,
    "confirmado_por_id" TEXT,

    CONSTRAINT "plano_pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes_financeiras" (
    "id" TEXT NOT NULL,
    "tipo" "TransacaoTipo" NOT NULL DEFAULT 'RECEITA',
    "categoria" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" VARCHAR(500),
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" "TransacaoOrigem" NOT NULL DEFAULT 'OUTRO',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "terreiro_id" TEXT NOT NULL,
    "registrado_por_id" TEXT,

    CONSTRAINT "transacoes_financeiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pix_configuracoes" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "tipoChave" "PixChaveTipo" NOT NULL DEFAULT 'CPF',
    "titulo" TEXT DEFAULT 'Doação para o terreiro',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "pix_configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "planos_saas_slug_key" ON "planos_saas"("slug");

-- CreateIndex
CREATE INDEX "planos_saas_ativo_ordem_idx" ON "planos_saas"("ativo", "ordem");

-- CreateIndex
CREATE INDEX "plano_assinaturas_terreiro_id_status_idx" ON "plano_assinaturas"("terreiro_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plano_assinaturas_terreiro_id_plano_id_key" ON "plano_assinaturas"("terreiro_id", "plano_id");

-- CreateIndex
CREATE INDEX "plano_pagamentos_assinatura_id_status_idx" ON "plano_pagamentos"("assinatura_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plano_pagamentos_assinatura_id_referencia_key" ON "plano_pagamentos"("assinatura_id", "referencia");

-- CreateIndex
CREATE INDEX "transacoes_financeiras_terreiro_id_data_idx" ON "transacoes_financeiras"("terreiro_id", "data");

-- CreateIndex
CREATE INDEX "transacoes_financeiras_terreiro_id_tipo_idx" ON "transacoes_financeiras"("terreiro_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "pix_configuracoes_terreiro_id_key" ON "pix_configuracoes"("terreiro_id");

-- AddForeignKey
ALTER TABLE "plano_assinaturas" ADD CONSTRAINT "plano_assinaturas_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_assinaturas" ADD CONSTRAINT "plano_assinaturas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos_saas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_pagamentos" ADD CONSTRAINT "plano_pagamentos_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "plano_assinaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_pagamentos" ADD CONSTRAINT "plano_pagamentos_confirmado_por_id_fkey" FOREIGN KEY ("confirmado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_financeiras" ADD CONSTRAINT "transacoes_financeiras_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes_financeiras" ADD CONSTRAINT "transacoes_financeiras_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pix_configuracoes" ADD CONSTRAINT "pix_configuracoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
