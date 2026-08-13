-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VISITOR', 'PRACTITIONER', 'DIRIGENTE', 'OGA', 'EKEDI', 'FILHO_DE_SANTO', 'MEMBER', 'CO_ADMIN', 'CURATOR', 'MODERATOR', 'VERIFIER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TerreiroStatus" AS ENUM ('RASCUNHO', 'PENDENTE_REVISAO', 'EM_REVISAO', 'AGUARDANDO_DIRIGENTE', 'PUBLICADO', 'EM_EDICAO', 'RECUSADO', 'BLOQUEADO', 'ARQUIVADO', 'SUSPENSO', 'VERIFICADO');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('BASICO', 'DOCUMENTAL', 'COMUNITARIO', 'AVANCADO', 'COMPLETO');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GIRA', 'TOQUE', 'FESTA_RELIGIOSA', 'PALESTRA', 'CURSO', 'DESENVOLVIMENTO_MEDIUNICO', 'ACAO_SOCIAL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VISITOR',
    "avatar_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refresh_token" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terreiros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tradicao" TEXT NOT NULL,
    "status" "TerreiroStatus" NOT NULL DEFAULT 'RASCUNHO',
    "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descricao_curta" VARCHAR(500),
    "descricao_longa" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geo_point" geography(Point, 4326),
    "telefone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "horario_funcionamento" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_level" "VerificationLevel" NOT NULL DEFAULT 'BASICO',
    "foto_url" TEXT,
    "ano_fundacao" INTEGER,
    "linhagem" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "facebook" TEXT,
    "acessibilidade" BOOLEAN NOT NULL DEFAULT false,
    "estacionamento" VARCHAR(20),
    "codigo_indicacao" TEXT,
    "publicado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,
    "dirigente_id" TEXT,

    CONSTRAINT "terreiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "texto" VARCHAR(2000),
    "peso_avaliador" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "util_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "EventType" NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "capacidade" INTEGER,
    "is_publico" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "terreiro_id" TEXT NOT NULL,
    "criado_por_id" TEXT NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("usuario_id","terreiro_id")
);

-- CreateTable
CREATE TABLE "membros_terreiro" (
    "id" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'COLABORADOR',
    "convite_status" TEXT NOT NULL DEFAULT 'ACEITO',
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "convidado_por_id" TEXT,

    CONSTRAINT "membros_terreiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "modalidade" TEXT,
    "carga_horaria" INTEGER,
    "vagas" INTEGER,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas_curso" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,

    CONSTRAINT "matriculas_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_marketplace" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "imagens" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "produtos_marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conteudos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT,
    "url" TEXT,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "criado_por_id" TEXT NOT NULL,
    "terreiro_id" TEXT,

    CONSTRAINT "conteudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acoes_sociais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT,
    "data" TIMESTAMP(3),
    "alcance" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "acoes_sociais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_verificacao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "arquivo_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "documentos_verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terreiro_fotos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumb_url" TEXT,
    "alt" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "is_principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "terreiro_fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terreiro_videos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "terreiro_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacao_respostas" (
    "id" TEXT NOT NULL,
    "texto" VARCHAR(3000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avaliacao_id" TEXT NOT NULL,

    CONSTRAINT "avaliacao_respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade_tipo" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "antes" JSONB,
    "depois" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguidores_terreiro" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "seguidores_terreiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presenca_eventos" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,

    CONSTRAINT "presenca_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicacoes" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "convertido_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indicador_id" TEXT NOT NULL,
    "indicado_id" TEXT NOT NULL,
    "terreiro_id" TEXT,

    CONSTRAINT "indicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessos_qrcode" (
    "id" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "acessos_qrcode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_reivindicacao" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "documento_url" TEXT,
    "mensagem" TEXT,
    "revisado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "revisado_por_id" TEXT,

    CONSTRAINT "pedidos_reivindicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missoes" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "requisitos" JSONB,
    "reward_ax_score" INTEGER NOT NULL DEFAULT 5,
    "reward_trust_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_missoes" (
    "id" TEXT NOT NULL,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "completado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,

    CONSTRAINT "usuario_missoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conquistas" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "icone" TEXT,
    "categoria" TEXT,
    "requisitos" JSONB,
    "reward_ax_score" INTEGER NOT NULL DEFAULT 10,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conquistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_conquistas" (
    "id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,

    CONSTRAINT "usuario_conquistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "axscore_history" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "razao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "axscore_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acoes_evolucao" (
    "id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "ax_score_delta" INTEGER NOT NULL DEFAULT 0,
    "trust_score_delta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "acoes_evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas_evolucao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "target_date" TIMESTAMP(3),
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "completado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "metas_evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_analytics" (
    "id" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT,
    "terreiro_id" TEXT,
    "sessao_id" TEXT,
    "origem" TEXT,
    "dispositivo" TEXT,
    "versao" TEXT,
    "metadata" JSONB,
    "cidade" TEXT,
    "estado" TEXT,

    CONSTRAINT "eventos_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "regras" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flag_overrides" (
    "id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "terreiro_id" TEXT,
    "cidade" TEXT,
    "estado" TEXT,

    CONSTRAINT "feature_flag_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'SUGESTAO',
    "mensagem" TEXT NOT NULL,
    "pagina" TEXT,
    "contato" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "terreiros_slug_key" ON "terreiros"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "terreiros_codigo_indicacao_key" ON "terreiros"("codigo_indicacao");

-- CreateIndex
CREATE INDEX "terreiros_tradicao_cidade_estado_idx" ON "terreiros"("tradicao", "cidade", "estado");

-- CreateIndex
CREATE INDEX "terreiros_trust_score_idx" ON "terreiros"("trust_score");

-- CreateIndex
CREATE INDEX "terreiros_slug_idx" ON "terreiros"("slug");

-- CreateIndex
CREATE INDEX "avaliacoes_terreiro_id_nota_idx" ON "avaliacoes"("terreiro_id", "nota");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_usuario_id_terreiro_id_key" ON "avaliacoes"("usuario_id", "terreiro_id");

-- CreateIndex
CREATE INDEX "eventos_data_inicio_terreiro_id_idx" ON "eventos"("data_inicio", "terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "membros_terreiro_usuario_id_terreiro_id_key" ON "membros_terreiro"("usuario_id", "terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_curso_usuario_id_curso_id_key" ON "matriculas_curso"("usuario_id", "curso_id");

-- CreateIndex
CREATE INDEX "terreiro_fotos_terreiro_id_ordem_idx" ON "terreiro_fotos"("terreiro_id", "ordem");

-- CreateIndex
CREATE INDEX "terreiro_videos_terreiro_id_idx" ON "terreiro_videos"("terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacao_respostas_avaliacao_id_key" ON "avaliacao_respostas"("avaliacao_id");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_tipo_entidade_id_idx" ON "audit_logs"("entidade_tipo", "entidade_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "seguidores_terreiro_usuario_id_terreiro_id_key" ON "seguidores_terreiro"("usuario_id", "terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "presenca_eventos_usuario_id_evento_id_key" ON "presenca_eventos"("usuario_id", "evento_id");

-- CreateIndex
CREATE INDEX "indicacoes_indicador_id_idx" ON "indicacoes"("indicador_id");

-- CreateIndex
CREATE INDEX "indicacoes_terreiro_id_idx" ON "indicacoes"("terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "indicacoes_indicador_id_indicado_id_key" ON "indicacoes"("indicador_id", "indicado_id");

-- CreateIndex
CREATE INDEX "acessos_qrcode_terreiro_id_created_at_idx" ON "acessos_qrcode"("terreiro_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_reivindicacao_usuario_id_terreiro_id_key" ON "pedidos_reivindicacao"("usuario_id", "terreiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "missoes_key_key" ON "missoes"("key");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_missoes_usuario_id_terreiro_id_mission_id_key" ON "usuario_missoes"("usuario_id", "terreiro_id", "mission_id");

-- CreateIndex
CREATE UNIQUE INDEX "conquistas_key_key" ON "conquistas"("key");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_conquistas_usuario_id_terreiro_id_achievement_id_key" ON "usuario_conquistas"("usuario_id", "terreiro_id", "achievement_id");

-- CreateIndex
CREATE INDEX "axscore_history_terreiro_id_created_at_idx" ON "axscore_history"("terreiro_id", "created_at");

-- CreateIndex
CREATE INDEX "acoes_evolucao_terreiro_id_created_at_idx" ON "acoes_evolucao"("terreiro_id", "created_at");

-- CreateIndex
CREATE INDEX "metas_evolucao_terreiro_id_idx" ON "metas_evolucao"("terreiro_id");

-- CreateIndex
CREATE INDEX "eventos_analytics_evento_timestamp_idx" ON "eventos_analytics"("evento", "timestamp");

-- CreateIndex
CREATE INDEX "eventos_analytics_usuario_id_timestamp_idx" ON "eventos_analytics"("usuario_id", "timestamp");

-- CreateIndex
CREATE INDEX "eventos_analytics_timestamp_idx" ON "eventos_analytics"("timestamp");

-- CreateIndex
CREATE INDEX "eventos_analytics_evento_idx" ON "eventos_analytics"("evento");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_chave_key" ON "feature_flags"("chave");

-- CreateIndex
CREATE INDEX "feature_flag_overrides_flag_id_idx" ON "feature_flag_overrides"("flag_id");

-- CreateIndex
CREATE INDEX "feedbacks_tipo_idx" ON "feedbacks"("tipo");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_lida_idx" ON "notificacoes"("usuario_id", "lida");

-- AddForeignKey
ALTER TABLE "terreiros" ADD CONSTRAINT "terreiros_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreiros" ADD CONSTRAINT "terreiros_dirigente_id_fkey" FOREIGN KEY ("dirigente_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_terreiro" ADD CONSTRAINT "membros_terreiro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_terreiro" ADD CONSTRAINT "membros_terreiro_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_terreiro" ADD CONSTRAINT "membros_terreiro_convidado_por_id_fkey" FOREIGN KEY ("convidado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas_curso" ADD CONSTRAINT "matriculas_curso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas_curso" ADD CONSTRAINT "matriculas_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_marketplace" ADD CONSTRAINT "produtos_marketplace_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acoes_sociais" ADD CONSTRAINT "acoes_sociais_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_verificacao" ADD CONSTRAINT "documentos_verificacao_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreiro_fotos" ADD CONSTRAINT "terreiro_fotos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terreiro_videos" ADD CONSTRAINT "terreiro_videos_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacao_respostas" ADD CONSTRAINT "avaliacao_respostas_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores_terreiro" ADD CONSTRAINT "seguidores_terreiro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores_terreiro" ADD CONSTRAINT "seguidores_terreiro_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca_eventos" ADD CONSTRAINT "presenca_eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca_eventos" ADD CONSTRAINT "presenca_eventos_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_indicador_id_fkey" FOREIGN KEY ("indicador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_indicado_id_fkey" FOREIGN KEY ("indicado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acessos_qrcode" ADD CONSTRAINT "acessos_qrcode_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reivindicacao" ADD CONSTRAINT "pedidos_reivindicacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reivindicacao" ADD CONSTRAINT "pedidos_reivindicacao_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_reivindicacao" ADD CONSTRAINT "pedidos_reivindicacao_revisado_por_id_fkey" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_missoes" ADD CONSTRAINT "usuario_missoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_missoes" ADD CONSTRAINT "usuario_missoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_missoes" ADD CONSTRAINT "usuario_missoes_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "conquistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "axscore_history" ADD CONSTRAINT "axscore_history_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acoes_evolucao" ADD CONSTRAINT "acoes_evolucao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acoes_evolucao" ADD CONSTRAINT "acoes_evolucao_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas_evolucao" ADD CONSTRAINT "metas_evolucao_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_analytics" ADD CONSTRAINT "eventos_analytics_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flag_overrides" ADD CONSTRAINT "feature_flag_overrides_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flag_overrides" ADD CONSTRAINT "feature_flag_overrides_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
