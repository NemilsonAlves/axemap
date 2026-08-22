-- CreateEnum
CREATE TYPE "ProdutoStatus" AS ENUM ('ATIVO', 'INATIVO', 'ESGOTADO', 'RASCUNHO');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('CRIADO', 'PAGO', 'CONFIRMADO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "ComissaoStatus" AS ENUM ('PENDENTE', 'CALCULADA', 'PAGA', 'CANCELADA');

-- AlterTable: ProdutosMarketplace
ALTER TABLE "produtos_marketplace" ADD COLUMN "slug" TEXT;
ALTER TABLE "produtos_marketplace" ADD COLUMN "preco_promocional" DOUBLE PRECISION;
ALTER TABLE "produtos_marketplace" ADD COLUMN "status" "ProdutoStatus" NOT NULL DEFAULT 'ATIVO';

-- CreateIndex: unique slug
CREATE UNIQUE INDEX "produtos_marketplace_slug_key" ON "produtos_marketplace"("slug");

-- CreateTable: PedidosMarketplace
CREATE TABLE "pedidos_marketplace" (
    "id" TEXT NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'CRIADO',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "comissao_percent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "comissao_valor" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "metodo_pagamento" TEXT,
    "gateway_ref" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "comprador_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "pedidos_marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PedidoItem
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_marketplace_gateway_ref_key" ON "pedidos_marketplace"("gateway_ref");

-- CreateIndex
CREATE INDEX "pedidos_marketplace_comprador_id_idx" ON "pedidos_marketplace"("comprador_id");

-- CreateIndex
CREATE INDEX "pedidos_marketplace_terreiro_id_idx" ON "pedidos_marketplace"("terreiro_id");

-- CreateIndex
CREATE INDEX "pedidos_marketplace_status_idx" ON "pedidos_marketplace"("status");

-- AddForeignKey
ALTER TABLE "pedidos_marketplace" ADD CONSTRAINT "pedidos_marketplace_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_marketplace" ADD CONSTRAINT "pedidos_marketplace_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos_marketplace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos_marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: slug from nome for existing products
UPDATE "produtos_marketplace" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("nome", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE "produtos_marketplace" ALTER COLUMN "slug" SET NOT NULL;
