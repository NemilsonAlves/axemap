-- CreateTable
CREATE TABLE "certificacoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONCEDIDO',
    "concedido_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3),
    "revogado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "terreiro_id" TEXT NOT NULL,
    "concedido_por_id" TEXT,
    "revogado_por_id" TEXT,

    CONSTRAINT "certificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediacoes" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTRADA',
    "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "origem" TEXT NOT NULL DEFAULT 'USUARIO',
    "assunto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "resolucao" TEXT,
    "publicar" BOOLEAN NOT NULL DEFAULT false,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerrado_em" TIMESTAMP(3),
    "publicado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reclamante_id" TEXT NOT NULL,
    "moderador_id" TEXT,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "mediacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediacao_mensagens" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autorTipo" TEXT NOT NULL DEFAULT 'USUARIO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediacao_id" TEXT NOT NULL,
    "autor_id" TEXT,

    CONSTRAINT "mediacao_mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checklists" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "terreiro_id" TEXT NOT NULL,

    CONSTRAINT "compliance_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_itens" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "conforme" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checklist_id" TEXT NOT NULL,

    CONSTRAINT "compliance_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antifraude_registros" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "risco" TEXT NOT NULL DEFAULT 'BAIXO',
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "detalhes" JSONB,
    "decisao_humana" TEXT,
    "revisao_humana_obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "entidade_tipo" TEXT,
    "entidade_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisado_em" TIMESTAMP(3),
    "criado_por_id" TEXT,
    "revisto_por_id" TEXT,

    CONSTRAINT "antifraude_registros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "referencia_tipo" TEXT NOT NULL,
    "referencia_id" TEXT,
    "url" TEXT,
    "descricao" TEXT,
    "validada" BOOLEAN NOT NULL DEFAULT false,
    "validado_em" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terreiro_id" TEXT,
    "criado_por_id" TEXT,
    "validado_por_id" TEXT,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "governanca_membros" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "biografia" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "governanca_membros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificacoes_codigo_key" ON "certificacoes"("codigo");

-- CreateIndex
CREATE INDEX "certificacoes_terreiro_id_status_idx" ON "certificacoes"("terreiro_id", "status");

-- CreateIndex
CREATE INDEX "certificacoes_tipo_idx" ON "certificacoes"("tipo");

-- CreateIndex
CREATE INDEX "mediacoes_status_created_at_idx" ON "mediacoes"("status", "created_at");

-- CreateIndex
CREATE INDEX "mediacao_mensagens_mediacao_id_created_at_idx" ON "mediacao_mensagens"("mediacao_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_checklists_terreiro_id_periodo_key" ON "compliance_checklists"("terreiro_id", "periodo");

-- CreateIndex
CREATE INDEX "compliance_itens_checklist_id_idx" ON "compliance_itens"("checklist_id");

-- CreateIndex
CREATE INDEX "antifraude_registros_risco_status_idx" ON "antifraude_registros"("risco", "status");

-- CreateIndex
CREATE INDEX "evidencias_referencia_tipo_referencia_id_idx" ON "evidencias"("referencia_tipo", "referencia_id");

-- AddForeignKey
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_concedido_por_id_fkey" FOREIGN KEY ("concedido_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_revogado_por_id_fkey" FOREIGN KEY ("revogado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediacoes" ADD CONSTRAINT "mediacoes_reclamante_id_fkey" FOREIGN KEY ("reclamante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediacoes" ADD CONSTRAINT "mediacoes_moderador_id_fkey" FOREIGN KEY ("moderador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediacoes" ADD CONSTRAINT "mediacoes_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediacao_mensagens" ADD CONSTRAINT "mediacao_mensagens_mediacao_id_fkey" FOREIGN KEY ("mediacao_id") REFERENCES "mediacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediacao_mensagens" ADD CONSTRAINT "mediacao_mensagens_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_itens" ADD CONSTRAINT "compliance_itens_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "compliance_checklists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antifraude_registros" ADD CONSTRAINT "antifraude_registros_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antifraude_registros" ADD CONSTRAINT "antifraude_registros_revisto_por_id_fkey" FOREIGN KEY ("revisto_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_terreiro_id_fkey" FOREIGN KEY ("terreiro_id") REFERENCES "terreiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_validado_por_id_fkey" FOREIGN KEY ("validado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
