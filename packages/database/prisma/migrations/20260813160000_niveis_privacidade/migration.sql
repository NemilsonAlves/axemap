-- CreateEnum
CREATE TYPE "NivelPrivacidade" AS ENUM ('PUBLICO', 'COMUNITARIO', 'RESTRITO', 'PRIVADO', 'SENSIVEL');

-- AlterTable
ALTER TABLE "terreiros" ADD COLUMN     "nivel_privacidade" "NivelPrivacidade" NOT NULL DEFAULT 'PUBLICO';

-- AlterTable
ALTER TABLE "eventos" ADD COLUMN     "nivel_privacidade" "NivelPrivacidade" NOT NULL DEFAULT 'PUBLICO';

-- AlterTable
ALTER TABLE "conteudos_culturais" ADD COLUMN     "nivel_privacidade" "NivelPrivacidade" NOT NULL DEFAULT 'PUBLICO';

-- AlterTable
ALTER TABLE "patrimonio_cultural" ADD COLUMN     "nivel_privacidade" "NivelPrivacidade" NOT NULL DEFAULT 'PUBLICO';