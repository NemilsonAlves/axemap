-- CreateEnum
CREATE TYPE "GraphEntidadeTipo" AS ENUM ('TERREIRO', 'INSTITUICAO', 'EVENTO', 'CURSO', 'CAMPANHA', 'ACAO_SOCIAL', 'PROJETO', 'CONTEUDO', 'PESQUISA', 'PATRIMONIO', 'PRODUTO', 'PESSOA', 'COMUNIDADE');

-- CreateEnum
CREATE TYPE "GraphRelacionamentoTipo" AS ENUM ('PERTENCE_A', 'LOCALIZADO_EM', 'ORGANIZA', 'PARTICIPA', 'MINISTRA', 'OFERECE', 'PATROCINA', 'APOIA', 'COLABORA_COM', 'RELACIONADO_A', 'FAZ_PARTE_DE', 'PESQUISA', 'PUBLICOU', 'PRESERVA', 'PROMOVE', 'REALIZA', 'PARTICIPA_DE', 'RECEBE_APOIO_DE', 'GERENCIA', 'CERTIFICADO_POR', 'VERIFICADO_POR', 'TEM_EVENTO', 'TEM_CURSO', 'TEM_PROJETO', 'TEM_CAMPANHA', 'TEM_CONTEUDO');

-- CreateEnum
CREATE TYPE "GraphStatus" AS ENUM ('PENDENTE', 'VERIFICADO', 'REJEITADO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "GraphFonte" AS ENUM ('INSTITUICAO', 'USUARIO', 'ADMIN', 'API_EXTERNA', 'PESQUISA', 'DOCUMENTO', 'IA_SUGERIDO');

-- CreateEnum
CREATE TYPE "ConteudoCulturalTipo" AS ENUM ('PATRIMONIO', 'HISTORIA', 'TRADICOES', 'MUSICA', 'DANCA', 'ARTE', 'LITERATURA', 'GASTRONOMIA', 'ARTESANATO', 'DOCUMENTARIO', 'ENTREVISTA', 'PESQUISA');

-- CreateEnum
CREATE TYPE "ConteudoStatus" AS ENUM ('NAO_VERIFICADA', 'VERIFICADA', 'OFICIAL');

-- CreateEnum
CREATE TYPE "DuplicidadeStatus" AS ENUM ('ABERTO', 'CONFIRMADO', 'REJEITADO', 'IGNORADO');

-- CreateTable
CREATE TABLE "graph_entidades" (
    "id" TEXT NOT NULL,
    "entidade_tipo" "GraphEntidadeTipo" NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT,
    "descricao_curta" VARCHAR(500),
    "cidade" TEXT,
    "estado" VARCHAR(2),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vetor" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "visivel" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "origem" "GraphFonte" NOT NULL DEFAULT 'USUARIO',
    "criadoPorId" TEXT,
    "status_indexado" TEXT NOT NULL DEFAULT 'INDEXADO',
    "indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "graph_entidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_relacionamentos" (
    "id" TEXT NOT NULL,
    "tipo" "GraphRelacionamentoTipo" NOT NULL,
    "rotulo" TEXT,
    "status" "GraphStatus" NOT NULL DEFAULT 'PENDENTE',
    "nivel_confianca" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fonte" "GraphFonte" NOT NULL DEFAULT 'USUARIO',
    "evidencia" TEXT,
    "valido_de" TIMESTAMP(3),
    "valido_ate" TIMESTAMP(3),
    "motivo" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "origem_entidade_id" TEXT NOT NULL,
    "alvo_entidade_id" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "verificadoPorId" TEXT,
    "rejeitadoPorId" TEXT,
    "verificado_em" TIMESTAMP(3),

    CONSTRAINT "graph_relacionamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_relacionamentos_historico" (
    "id" TEXT NOT NULL,
    "versao" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "antes" JSONB,
    "depois" JSONB,
    "por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relacionamento_id" TEXT NOT NULL,

    CONSTRAINT "graph_relacionamentos_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graph_duplicidades" (
    "id" TEXT NOT NULL,
    "entidade_tipo" "GraphEntidadeTipo" NOT NULL,
    "entidade_id_a" TEXT NOT NULL,
    "entidade_id_b" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "status" "DuplicidadeStatus" NOT NULL DEFAULT 'ABERTO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolvido_em" TIMESTAMP(3),
    "criadoPorId" TEXT,
    "resolvidoPorId" TEXT,

    CONSTRAINT "graph_duplicidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudos_culturais" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "ConteudoCulturalTipo" NOT NULL,
    "resumo" TEXT,
    "corpo" TEXT,
    "url" TEXT,
    "autor_nome" TEXT,
    "fonte" TEXT,
    "data_publicacao" TIMESTAMP(3),
    "licenca" TEXT,
    "origem" TEXT,
    "thumb_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ConteudoStatus" NOT NULL DEFAULT 'NAO_VERIFICADA',
    "cidade" TEXT,
    "estado" VARCHAR(2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criadoPorId" TEXT,
    "verificadoPorId" TEXT,
    "verificado_em" TIMESTAMP(3),
    "terreiroId" TEXT,
    "instituicaoId" TEXT,

    CONSTRAINT "conteudos_culturais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrimonio_cultural" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "cidade" TEXT,
    "estado" VARCHAR(2),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ano" INTEGER,
    "fonte" TEXT,
    "status" "ConteudoStatus" NOT NULL DEFAULT 'NAO_VERIFICADA',
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criadoPorId" TEXT,
    "verificadoPorId" TEXT,
    "verificado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patrimonio_cultural_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "graph_entidades_entidade_tipo_visivel_idx" ON "graph_entidades"("entidade_tipo", "visivel");

-- CreateIndex
CREATE INDEX "graph_entidades_cidade_estado_idx" ON "graph_entidades"("cidade", "estado");

-- CreateIndex
CREATE INDEX "graph_entidades_nome_idx" ON "graph_entidades"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "graph_entidades_entidade_tipo_entidade_id_key" ON "graph_entidades"("entidade_tipo", "entidade_id");

-- CreateIndex
CREATE INDEX "graph_relacionamentos_status_fonte_idx" ON "graph_relacionamentos"("status", "fonte");

-- CreateIndex
CREATE INDEX "graph_relacionamentos_origem_entidade_id_idx" ON "graph_relacionamentos"("origem_entidade_id");

-- CreateIndex
CREATE INDEX "graph_relacionamentos_alvo_entidade_id_idx" ON "graph_relacionamentos"("alvo_entidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "graph_relacionamentos_tipo_origem_entidade_id_alvo_entidade_key" ON "graph_relacionamentos"("tipo", "origem_entidade_id", "alvo_entidade_id");

-- CreateIndex
CREATE INDEX "graph_relacionamentos_historico_relacionamento_id_idx" ON "graph_relacionamentos_historico"("relacionamento_id");

-- CreateIndex
CREATE INDEX "graph_duplicidades_entidade_tipo_status_idx" ON "graph_duplicidades"("entidade_tipo", "status");

-- CreateIndex
CREATE INDEX "conteudos_culturais_tipo_status_idx" ON "conteudos_culturais"("tipo", "status");

-- CreateIndex
CREATE INDEX "conteudos_culturais_titulo_idx" ON "conteudos_culturais"("titulo");

-- CreateIndex
CREATE INDEX "patrimonio_cultural_cidade_estado_idx" ON "patrimonio_cultural"("cidade", "estado");

-- AddForeignKey
ALTER TABLE "graph_entidades" ADD CONSTRAINT "graph_entidades_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_origem_entidade_id_fkey" FOREIGN KEY ("origem_entidade_id") REFERENCES "graph_entidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_alvo_entidade_id_fkey" FOREIGN KEY ("alvo_entidade_id") REFERENCES "graph_entidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos" ADD CONSTRAINT "graph_relacionamentos_rejeitadoPorId_fkey" FOREIGN KEY ("rejeitadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos_historico" ADD CONSTRAINT "graph_relacionamentos_historico_por_id_fkey" FOREIGN KEY ("por_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_relacionamentos_historico" ADD CONSTRAINT "graph_relacionamentos_historico_relacionamento_id_fkey" FOREIGN KEY ("relacionamento_id") REFERENCES "graph_relacionamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_duplicidades" ADD CONSTRAINT "graph_duplicidades_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graph_duplicidades" ADD CONSTRAINT "graph_duplicidades_resolvidoPorId_fkey" FOREIGN KEY ("resolvidoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos_culturais" ADD CONSTRAINT "conteudos_culturais_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos_culturais" ADD CONSTRAINT "conteudos_culturais_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
