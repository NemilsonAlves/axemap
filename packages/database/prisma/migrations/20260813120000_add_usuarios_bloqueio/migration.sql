-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "bloqueado_em" TIMESTAMP(3),
ADD COLUMN     "motivo_bloqueio" TEXT;
