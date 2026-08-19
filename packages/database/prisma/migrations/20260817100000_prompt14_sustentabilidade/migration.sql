-- CreateEnum
CREATE TYPE "ApoioNivel" AS ENUM ('SEMENTE', 'GUARDIAO', 'AXE', 'MEMORIA', 'ANCESTRALIDADE', 'MANTENEDOR');

-- CreateEnum
CREATE TYPE "ApoioPeriodicidade" AS ENUM ('AVULSO', 'MENSAL');

-- CreateEnum
CREATE TYPE "ApoioPlataformaStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHADO', 'REEMBOLSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "LocalizacaoVisibilidade" AS ENUM ('PUBLICO', 'APROXIMADA', 'PRIVADA');

-- AlterEnum (alinhar schema ↔ banco: remover REMOVIDA não usado em código/dados)
BEGIN;
CREATE TYPE "OrgRelationshipStatus_new" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA');
ALTER TABLE "public"."organizacao_relacionamentos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "organizacao_relacionamentos" ALTER COLUMN "status" TYPE "OrgRelationshipStatus_new" USING ("status"::text::"OrgRelationshipStatus_new");
ALTER TYPE "OrgRelationshipStatus" RENAME TO "OrgRelationshipStatus_old";
ALTER TYPE "OrgRelationshipStatus_new" RENAME TO "OrgRelationshipStatus";
DROP TYPE "public"."OrgRelationshipStatus_old";
ALTER TABLE "organizacao_relacionamentos" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- DropForeignKey (constraint foi alterada no schema)
ALTER TABLE "denuncias" DROP CONSTRAINT "denuncias_criado_por_id_fkey";

-- AlterTable (alinhar schema ↔ banco)
ALTER TABLE "instituicoes" ALTER COLUMN "tipo" DROP DEFAULT;

-- AlterTable (Prompt 14 — localização segura + alinhamento continente)
ALTER TABLE "terreiros" ADD COLUMN     "visibilidade_localizacao" "LocalizacaoVisibilidade" NOT NULL DEFAULT 'PUBLICO',
ALTER COLUMN "continente" SET DATA TYPE TEXT;

-- CreateTable (Prompt 14 — Círculo de Apoiadores)
CREATE TABLE "apoios_plataforma" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "nivel" "ApoioNivel" NOT NULL,
    "periodicidade" "ApoioPeriodicidade" NOT NULL DEFAULT 'AVULSO',
    "status" "ApoioPlataformaStatus" NOT NULL DEFAULT 'PENDENTE',
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "mensagem" VARCHAR(600),
    "referencia" TEXT,
    "gateway_ref" TEXT,
    "pago_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "apoiador_id" TEXT NOT NULL,
    "confirmado_por_id" TEXT,

    CONSTRAINT "apoios_plataforma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "apoios_plataforma_status_created_at_idx" ON "apoios_plataforma"("status", "created_at");

-- CreateIndex
CREATE INDEX "apoios_plataforma_apoiador_id_status_idx" ON "apoios_plataforma"("apoiador_id", "status");

-- CreateIndex
CREATE INDEX "apoios_plataforma_nivel_idx" ON "apoios_plataforma"("nivel");

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apoios_plataforma" ADD CONSTRAINT "apoios_plataforma_apoiador_id_fkey" FOREIGN KEY ("apoiador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apoios_plataforma" ADD CONSTRAINT "apoios_plataforma_confirmado_por_id_fkey" FOREIGN KEY ("confirmado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;