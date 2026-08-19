-- AlterTable
ALTER TABLE "denuncias" ADD COLUMN     "protocolo" TEXT,
ADD COLUMN     "email_contato" TEXT,
ALTER COLUMN "criado_por_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "denuncias_protocolo_key" ON "denuncias"("protocolo");