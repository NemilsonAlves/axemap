# 41 — Modelo de Dados para Trust Score

## Novas Tabelas e Campos

### 1. Tabela: trust_score_log (Histórico de Score)

```sql
CREATE TABLE trust_score_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  
  -- Score total e componentes
  score_total DECIMAL(5,2) NOT NULL, -- 0.00 - 100.00
  componente_completeza DECIMAL(5,2) NOT NULL,
  componente_verificacao DECIMAL(5,2) NOT NULL,
  componente_atualizacao DECIMAL(5,2) NOT NULL,
  componente_reputacao DECIMAL(5,2) NOT NULL,
  componente_historico DECIMAL(5,2) NOT NULL,
  componente_social DECIMAL(5,2) NOT NULL,
  
  -- Nível
  nivel VARCHAR(50) NOT NULL, -- novo, estabelecido, confiavel, referencia, excelencia
  
  -- Metadados do recalculo
  motivo VARCHAR(255) NOT NULL, -- gatilho do recalculo
  evento_id UUID, -- referência ao evento que causou (domain event)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ts_log_terreiro ON trust_score_logs(terreiro_id, created_at DESC);
CREATE INDEX idx_ts_log_score ON trust_score_logs(score_total DESC);
```

### 2. Campos Adicionais em terreiros

```sql
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  trust_score DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  trust_score_nivel VARCHAR(50) DEFAULT 'novo';
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  trust_score_updated_at TIMESTAMP;
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  ultimo_login_at TIMESTAMP;
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  taxa_resposta DECIMAL(5,2) DEFAULT 0; -- % de respostas a avaliações
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  total_eventos_30d INTEGER DEFAULT 0;
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  total_acoes_sociais INTEGER DEFAULT 0;
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  completa_profile BOOLEAN DEFAULT false; -- >80% campos preenchidos
ALTER TABLE terreiros ADD COLUMN IF NOT EXISTS
  percentual_completeza DECIMAL(5,2) DEFAULT 0; -- % real de completeza
```

### 3. Tabela: verificacoes (Selos de Verificação)

```sql
CREATE TABLE verificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  
  tipo_verificacao VARCHAR(50) NOT NULL,
  -- contato, identidade, fotos, informacoes, premium
  
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  -- pendente, aprovado, rejeitado, revogado
  
  dados_verificacao JSONB, -- dados específicos do tipo de verificação
  -- ex: { "documento_front": "url", "documento_back": "url", "selfie": "url" }
  
  verificado_por UUID REFERENCES usuarios(id), -- admin que aprovou
  verificado_em TIMESTAMP,
  expira_em TIMESTAMP, -- se aplicável
  
  motivo_rejeicao VARCHAR(255),
  revogado_em TIMESTAMP,
  revogado_motivo VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verificacoes_terreiro ON verificacoes(terreiro_id, tipo_verificacao);
CREATE INDEX idx_verificacoes_status ON verificacoes(status);
```

### 4. Tabela: metricas_terreiro (Cache de Métricas)

```sql
CREATE TABLE metricas_terreiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  
  -- Completeza
  total_campos INTEGER DEFAULT 17, -- total de campos no formulário
  campos_preenchidos INTEGER DEFAULT 0,
  
  -- Verificação
  total_verificacoes INTEGER DEFAULT 0,
  verificacoes_aprovadas INTEGER DEFAULT 0,
  
  -- Atualização
  dias_desde_ultima_atualizacao INTEGER,
  dias_desde_ultimo_evento INTEGER,
  dias_desde_ultimo_login INTEGER,
  total_eventos_ultimos_30d INTEGER DEFAULT 0,
  total_eventos_ultimos_90d INTEGER DEFAULT 0,
  
  -- Reputação
  total_avaliacoes INTEGER DEFAULT 0,
  media_avaliacoes DECIMAL(2,1) DEFAULT 0.0,
  total_avaliacoes_uteis INTEGER DEFAULT 0,
  total_recomendacoes INTEGER DEFAULT 0, -- % de 4+ estrelas
  
  -- Histórico
  dias_na_plataforma INTEGER DEFAULT 0,
  total_denuncias_recebidas INTEGER DEFAULT 0,
  denuncias_confirmadas INTEGER DEFAULT 0,
  
  -- Engajamento Social
  total_acoes_sociais INTEGER DEFAULT 0,
  taxa_resposta_avaliacoes DECIMAL(5,2) DEFAULT 0.0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(terreiro_id)
);

CREATE INDEX idx_metricas_terreiro ON metricas_terreiro(terreiro_id);
```

### 5. Tabela: sinalizacoes_trust (Alertas de Score)

```sql
CREATE TABLE sinalizacoes_trust (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  
  tipo_sinalizacao VARCHAR(100) NOT NULL,
  -- score_caiu_rapido, denuncia_confirmada, inatividade, informacao_falsa
  
  descricao TEXT,
  impacto_score DECIMAL(5,2), -- quanto o score foi impactado
  resolvido BOOLEAN DEFAULT false,
  resolvido_em TIMESTAMP,
  resolvido_por UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sinalizacoes_trust ON sinalizacoes_trust(terreiro_id, resolvido);
```

### 6. Campos em avaliacoes (Peso do Avaliador)

```sql
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS
  peso_avaliador DECIMAL(3,1) DEFAULT 1.0; -- 0.5, 1.0, 1.5, 2.0, 2.5, 3.0
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS
  score_contribuicao DECIMAL(5,2); -- nota × peso_avaliador (para cálculos)
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS
  total_uteis INTEGER DEFAULT 0;
```

### 7. Tabela: reputacao_avaliador

```sql
CREATE TABLE reputacao_avaliador (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  nivel VARCHAR(50) DEFAULT 'novo',
  total_avaliacoes INTEGER DEFAULT 0,
  avaliacoes_aprovadas INTEGER DEFAULT 0,
  avaliacoes_rejeitadas INTEGER DEFAULT 0,
  taxa_aprovacao DECIMAL(5,2) DEFAULT 0,
  total_uteis_recebidos INTEGER DEFAULT 0,
  dias_na_plataforma INTEGER DEFAULT 0,
  peso_atual DECIMAL(3,1) DEFAULT 0.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Tabela: sessoes_verificacao (Document Upload Tracking)

```sql
CREATE TABLE sessoes_verificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  tipo_verificacao VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'iniciada',
  documentos_urls JSONB, -- { "documento_front": "url_crypt", ... }
  hash_documentos VARCHAR(64), -- SHA-256 dos documentos (anti-fraude)
  ip_address VARCHAR(45),
  user_agent TEXT,
  iniciada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  concluida_em TIMESTAMP,
  resultado VARCHAR(50),
  observacoes TEXT
);
```

## Views Úteis

### View: v_trust_score_atual

```sql
CREATE VIEW v_trust_score_atual AS
SELECT
  t.id as terreiro_id,
  t.nome as terreiro_nome,
  t.slug,
  COALESCE(mt.campos_preenchidos, 0) as campos_preenchidos,
  mt.total_avaliacoes,
  mt.media_avaliacoes,
  COALESCE(va.total_verificacoes_aprovadas, 0) as total_verificacoes,
  t.trust_score,
  t.trust_score_nivel,
  t.ultimo_login_at
FROM terreiros t
LEFT JOIN metricas_terreiro mt ON mt.terreiro_id = t.id
LEFT JOIN (
  SELECT terreiro_id, COUNT(*) as total_verificacoes_aprovadas
  FROM verificacoes WHERE status = 'aprovado'
  GROUP BY terreiro_id
) va ON va.terreiro_id = t.id
WHERE t.deleted_at IS NULL;
```

### View: v_trust_score_ranking

```sql
CREATE VIEW v_trust_score_ranking AS
SELECT
  t.id,
  t.nome,
  t.cidade,
  t.estado,
  t.tradicao,
  t.trust_score,
  t.trust_score_nivel,
  t.avaliacao_media,
  t.total_avaliacoes,
  RANK() OVER (ORDER BY t.trust_score DESC) as ranking_geral,
  RANK() OVER (PARTITION BY t.estado ORDER BY t.trust_score DESC) as ranking_estado,
  RANK() OVER (PARTITION BY t.tradicao ORDER BY t.trust_score DESC) as ranking_tradicao
FROM terreiros t
WHERE t.deleted_at IS NULL AND t.is_published = true AND t.trust_score > 0;
```

## Eventos de Domínio para Trust Score

(Detalhado no documento 42)
