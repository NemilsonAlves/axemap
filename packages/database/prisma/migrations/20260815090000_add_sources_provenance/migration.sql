-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT,
    "instituicao" TEXT,
    "url" VARCHAR(1000),
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "idioma" TEXT DEFAULT 'pt-BR',
    "referencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NAO_VERIFICADA',
    "conteudo" TEXT,
    "criado_por_id" TEXT,
    "verificado_por_id" TEXT,
    "verificado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sources_tipo_status_idx" ON "sources"("tipo", "status");

-- CreateIndex
CREATE INDEX "sources_autor_idx" ON "sources"("autor");

-- AlterTable
ALTER TABLE "graph_relacionamentos" ADD COLUMN "source_id" TEXT;

-- CreateIndex
CREATE INDEX "graph_relacionamentos_source_id_idx" ON "graph_relacionamentos"("source_id");

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_verificado_por_id_fkey" FOREIGN KEY ("verificado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;