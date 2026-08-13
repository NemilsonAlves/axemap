-- CreateTable
CREATE TABLE "denuncias" (
    "id" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'TERREIRO',
    "entidade_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolvido_em" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,
    "revisado_por_id" TEXT,
    "terreiro_id" TEXT,

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "denuncias_status_created_at_idx" ON "denuncias"("status", "created_at");

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_revisado_por_id_fkey" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;
