# 07 — Modelagem do Banco de Dados

## Princípios

- **UUID v7** para todas as chaves primárias (ordenável por tempo, sem conflitos)
- **Soft delete** (`deleted_at TIMESTAMP`) em todas as tabelas de negócio
- **Audit logs** (`created_at`, `updated_at`, `created_by`, `updated_by`)
- **Versionamento** implícito via audit trail (tabela separada de `audit_logs`)
- **Row-Level Security (RLS)** no PostgreSQL para isolamento multi-tenant
- **Índices compostos** para queries de busca e geolocalização
- **Constraints de unicidade** em relacionamentos críticos
- **Check constraints** para validação de domínio a nível de banco

## Convenções

- Nomes: snake_case
- Plural para tabelas (`terreiros`, `usuarios`, `avaliacoes`)
- Chave estrangeira: `{tabela}_id`
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Soft delete: todas as queries devem filtrar `WHERE deleted_at IS NULL`
- Enum PostgreSQL ou check constraints (preferir check + Zod validation)

## Schema Principal

### 1. Usuários

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP,
  password_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  apelido VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  data_nascimento DATE,
  genero VARCHAR(50),
  telefone VARCHAR(20),
  telefone_verificado BOOLEAN DEFAULT false,
  
  -- LGPD
  consentimento_dados BOOLEAN NOT NULL DEFAULT false,
  consentimento_marketing BOOLEAN NOT NULL DEFAULT false,
  consentimento_compartilhamento BOOLEAN NOT NULL DEFAULT false,
  data_consentimento TIMESTAMP,
  data_solicitacao_exclusao TIMESTAMP,

  -- Roles
  role VARCHAR(50) NOT NULL DEFAULT 'visitante',
  -- Roles: admin, visitante, praticante, dirigente, ogã, ekedi, filho_de_santo, cambono

  -- Preferências
  religiao_preferida VARCHAR(100),
  linha_espiritual_preferida VARCHAR(100),
  busca_visitante BOOLEAN DEFAULT false,
  busca_desenvolvimento BOOLEAN DEFAULT false,
  busca_infantil BOOLEAN DEFAULT false,
  busca_inclusivo BOOLEAN DEFAULT false,
  busca_acessibilidade BOOLEAN DEFAULT false,

  -- Segurança
  refresh_token TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,

  -- OAuth
  google_id VARCHAR(255),
  github_id VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP,

  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_role ON usuarios(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_religiao ON usuarios(religiao_preferida) WHERE deleted_at IS NULL;
```

### 2. Terreiros

```sql
CREATE TABLE terreiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- para subdomínio
  subdominio VARCHAR(255) UNIQUE, -- terreiro.axemap.com.br

  -- Informações básicas
  descricao_curta VARCHAR(300),
  descricao_longa TEXT,
  tradicao VARCHAR(100) NOT NULL,
  -- tradicao: umbanda, candomble, jurema, tambor_de_mina, xango, omoloco, umbanda_esoterica, umbanda_sagrada, outra
  outra_tradicao VARCHAR(255), -- se tradicao = 'outra'
  linha_espiritual VARCHAR(100),
  ano_fundacao INTEGER,

  -- Hierarquia
  dirigente_nome VARCHAR(255) NOT NULL,
  dirigente_cargo VARCHAR(100), -- pai_de_santo, mae_de_santo, etc.

  -- Endereço
  cep VARCHAR(9),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(150),
  cidade VARCHAR(150) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  pais VARCHAR(100) DEFAULT 'Brasil',
  
  -- Geolocalização
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  geo_point GEOMETRY(Point, 4326), -- PostGIS

  -- Contato
  telefone VARCHAR(20),
  whatsapp VARCHAR(20) NOT NULL,
  email_contato VARCHAR(255),
  site VARCHAR(255),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  youtube VARCHAR(255),
  tiktok VARCHAR(255),

  -- Características
  aceita_visitantes BOOLEAN DEFAULT false,
  desenvolvimento_medio BOOLEAN DEFAULT false,
  atendimento_social BOOLEAN DEFAULT false,
  tem_banheiros BOOLEAN DEFAULT false,
  acessibilidade BOOLEAN DEFAULT false,
  respeito_nome_social BOOLEAN DEFAULT false,
  ambiente_inclusivo BOOLEAN DEFAULT false,
  estacionamento BOOLEAN DEFAULT false,
  aceita_criancas BOOLEAN DEFAULT false,
  eventos_publicos BOOLEAN DEFAULT false,
  idiomas VARCHAR(255),

  -- Estatísticas
  visualizacoes INTEGER DEFAULT 0,
  avaliacao_media DECIMAL(2,1) DEFAULT 0.0,
  total_avaliacoes INTEGER DEFAULT 0,
  total_favoritos INTEGER DEFAULT 0,

  -- Plano
  plano_slug VARCHAR(50) DEFAULT 'gratuito',
  -- planos: gratuito, basico, profissional, enterprise
  data_expiracao_plano TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Verificação
  verificado BOOLEAN DEFAULT false,
  data_verificacao TIMESTAMP,
  verificado_por UUID REFERENCES usuarios(id),

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT,
  schema_json JSONB,

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pendente',
  -- status: pendente, aprovado, rejeitado, suspenso
  
  -- Audit
  owner_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_terreiros_slug ON terreiros(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_cidade_estado ON terreiros(cidade, estado) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX idx_terreiros_tradicao ON terreiros(tradicao) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_geo ON terreiros USING GIST(geo_point) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_avaliacao ON terreiros(avaliacao_media DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_owner ON terreiros(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_plano ON terreiros(plano_slug) WHERE deleted_at IS NULL;
```

### 3. Fotos

```sql
CREATE TABLE fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_thumb TEXT NOT NULL,
  url_medium TEXT,
  alt TEXT,
  legenda VARCHAR(300),
  ordem INTEGER DEFAULT 0,
  is_capa BOOLEAN DEFAULT false,
  tamanho_bytes BIGINT,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_fotos_terreiro ON fotos(terreiro_id) WHERE deleted_at IS NULL;
```

### 4. Vídeos

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  embed_url TEXT, -- YouTube/Vimeo embed
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  thumbnail_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_videos_terreiro ON videos(terreiro_id) WHERE deleted_at IS NULL;
```

### 5. Horários de Funcionamento

```sql
CREATE TABLE horarios_funcionamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  -- 0=domingo, 1=segunda, ..., 6=sábado
  abertura TIME,
  fechamento TIME,
  tipo VARCHAR(50) DEFAULT 'funcionamento',
  -- tipo: funcionamento, gira, atendimento, desenvolvimento, etc.
  descricao VARCHAR(255),
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_horarios_terreiro ON horarios_funcionamento(terreiro_id);
```

### 6. Avaliações

```sql
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  titulo VARCHAR(200),
  comentario TEXT,
  -- Moderação
  status VARCHAR(50) DEFAULT 'pendente',
  -- status: pendente, aprovado, rejeitado, sinalizado
  moderado_por UUID REFERENCES usuarios(id),
  data_moderacao TIMESTAMP,
  motivo_rejeicao VARCHAR(255),
  -- Métricas
  util_contagem INTEGER DEFAULT 0,
  reportado BOOLEAN DEFAULT false,
  -- Garante uma avaliação por usuário por terreiro
  UNIQUE(terreiro_id, usuario_id, deleted_at),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_avaliacoes_terreiro ON avaliacoes(terreiro_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_avaliacoes_usuario ON avaliacoes(usuario_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_avaliacoes_nota ON avaliacoes(nota) WHERE deleted_at IS NULL;
```

### 7. Favoritos

```sql
CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, terreiro_id)
);

CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_favoritos_terreiro ON favoritos(terreiro_id);
```

### 8. Eventos

```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100) NOT NULL,
  -- tipo: gira, toque, festa, palestra, curso, desenvolvimento, social, outro
  
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  hora_inicio TIME,
  hora_fim TIME,
  is_recorrente BOOLEAN DEFAULT false,
  recorrencia JSONB, -- regras de recorrência (rrule)
  
  local VARCHAR(255), -- se for em local diferente
  endereco_completo TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  capacidade_maxima INTEGER,
  vagas_disponiveis INTEGER,
  valor_ingresso DECIMAL(10,2),
  link_ingresso TEXT,
  link_transmissao TEXT,
  
  foto_capa_url TEXT,
  
  is_publico BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'agendado',
  -- status: agendado, acontecendo, encerrado, cancelado
  
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_eventos_terreiro ON eventos(terreiro_id, data_inicio) WHERE deleted_at IS NULL;
CREATE INDEX idx_eventos_data ON eventos(data_inicio) WHERE deleted_at IS NULL AND is_publico = true;
CREATE INDEX idx_eventos_tipo ON eventos(tipo) WHERE deleted_at IS NULL;
```

### 9. Membros do Terreiro (SaaS)

```sql
CREATE TABLE membros_terreiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo VARCHAR(100) NOT NULL,
  -- cargo: dirigente, pai_de_santo, mae_de_santo, ogã, ekedi, filho_de_santo, cambono, frequentador
  data_entrada DATE,
  data_saida DATE,
  is_ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(terreiro_id, usuario_id)
);

CREATE INDEX idx_membros_terreiro ON membros_terreiro(terreiro_id, is_ativo);
CREATE INDEX idx_membros_usuario ON membros_terreiro(usuario_id);
```

### 10. Transações Financeiras (SaaS)

```sql
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  -- tipo: doacao, mensalidade, receita_evento, despesa, investimento, outros
  categoria VARCHAR(100),
  descricao TEXT,
  valor DECIMAL(12,2) NOT NULL,
  metodo_pagamento VARCHAR(50),
  -- metodo: pix, dinheiro, cartao, transferencia, boleto
  status VARCHAR(50) DEFAULT 'pendente',
  data_transacao DATE NOT NULL,
  comprovante_url TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_transacoes_terreiro ON transacoes(terreiro_id, data_transacao) WHERE deleted_at IS NULL;
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo) WHERE deleted_at IS NULL;
```

### 11. Produtos (Marketplace)

```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  terreiro_id UUID REFERENCES terreiros(id), -- opcional: se for do terreiro
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  categoria_id UUID REFERENCES categorias_produto(id),
  estoque INTEGER DEFAULT 0,
  estoque_ilimitado BOOLEAN DEFAULT false,
  sku VARCHAR(100),
  peso_gramas INTEGER,
  dimensoes VARCHAR(100),
  
  -- Imagens
  imagem_capa_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'rascunho',
  -- status: rascunho, publicado, pausado, esgotado, arquivado
  is_featured BOOLEAN DEFAULT false,
  
  -- Métricas
  total_vendas INTEGER DEFAULT 0,
  avaliacao_media DECIMAL(2,1) DEFAULT 0.0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_produtos_vendedor ON produtos(vendedor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_produtos_status ON produtos(status) WHERE deleted_at IS NULL;
```

### 12. Categorias de Produto

```sql
CREATE TABLE categorias_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  parent_id UUID REFERENCES categorias_produto(id),
  ordem INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias iniciais:
-- Artigos Religiosos > Velas, Ervas, Defumadores, Guias, Fios de Conta
-- Vestuário > Axós, Roupas de Santo, Turbantes, Saias
-- Instrumentos > Atabaques, Agogôs, Adjás, Xequerês
-- Livros > Umbanda, Candomblé, História, Ritualística
-- Artesanato > Esculturas, Quadros, Objetos Decorativos
-- Cursos > EAD, Presencial, Palestras
-- Serviços > Consulta de Búzios, Limpeza Espiritual, Assistência
```

### 13. Pedidos (Marketplace)

```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id UUID NOT NULL REFERENCES usuarios(id),
  status VARCHAR(50) DEFAULT 'aguardando_pagamento',
  -- status: aguardando_pagamento, pago, preparando, enviado, entregue, cancelado, devolvido
  total DECIMAL(12,2) NOT NULL,
  frete DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  total_final DECIMAL(12,2) NOT NULL,
  metodo_pagamento VARCHAR(50),
  metodo_envio VARCHAR(100),
  codigo_rastreio VARCHAR(100),
  
  -- Endereço de entrega
  endereco_entrega JSONB NOT NULL,
  
  -- Transação financeira
  stripe_payment_intent_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),
  comissao_axemap DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14. Posts da Comunidade

```sql
CREATE TABLE posts_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  grupo_id UUID REFERENCES grupos_comunidade(id),
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'post',
  -- tipo: post, pergunta, evento, compartilhamento
  
  -- Mídia
  imagem_url TEXT,
  video_url TEXT,
  
  -- Métricas
  total_curtidas INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  total_compartilhamentos INTEGER DEFAULT 0,
  
  -- Moderação
  status VARCHAR(50) DEFAULT 'pendente',
  moderado_por UUID REFERENCES usuarios(id),
  data_moderacao TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_posts_grupo ON posts_comunidade(grupo_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_usuario ON posts_comunidade(usuario_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_data ON posts_comunidade(created_at DESC) WHERE deleted_at IS NULL;
```

### 15. Grupos da Comunidade

```sql
CREATE TABLE grupos_comunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  descricao TEXT,
  foto_capa_url TEXT,
  tipo VARCHAR(50) DEFAULT 'publico',
  -- tipo: publico, privado, secreto
  categoria VARCHAR(100),
  -- categoria: estudo, regiao, tradicao, suporte, musica, arte, etc.
  criado_por UUID REFERENCES usuarios(id),
  max_membros INTEGER,
  is_verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE membros_grupo (
  grupo_id UUID REFERENCES grupos_comunidade(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'membro',
  -- role: admin, moderador, membro
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (grupo_id, usuario_id)
);
```

### 16. Audit Logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  acao VARCHAR(50) NOT NULL,
  -- acao: create, update, delete, restore, login, logout, etc.
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES usuarios(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_tabela ON audit_logs(tabela, registro_id);
CREATE INDEX idx_audit_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_data ON audit_logs(created_at);
```

### 17. Notificações

```sql
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  -- tipo: nova_avaliacao, novo_evento, convite_grupo, promocao, etc.
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  dados JSONB, -- dados contextuais
  link TEXT,
  lida BOOLEAN DEFAULT false,
  lida_em TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id, lida, created_at DESC);
```

### 18. Sessões e Tokens

```sql
CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 19. Embeddings para Busca Semântica (Futuro IA)

```sql
CREATE TABLE embeddings_terreiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terreiro_id UUID NOT NULL REFERENCES terreiros(id) ON DELETE CASCADE,
  embedding vector(1536), -- pgvector
  texto_original TEXT,
  modelo VARCHAR(50) DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_terreiro ON embeddings_terreiro USING ivfflat (embedding vector_cosine_ops);
```

## Estratégia de Índices e Performance

### Índices Essenciais

| Tabela | Índice | Tipo | Motivo |
|--------|--------|------|--------|
| terreiros | geo_point | GIST | Busca geográfica |
| terreiros | (cidade, estado, tradicao) | BTREE | Filtros combinados |
| terreiros | avaliacao_media DESC | BTREE | Ordenação por melhor avaliados |
| terreiros | slug | UNIQUE BTREE | Subdomínio |
| avaliacoes | (terreiro_id, status) | BTREE | Listagem de avaliações |
| eventos | (data_inicio, is_publico) | BTREE | Calendário público |
| audit_logs | (tabela, registro_id) | BTREE | Auditoria |
| embeddings_terreiro | embedding | IVFFlat | Busca semântica |

### Sharding Considerações (pós 2 anos)

- **Por região:** Terreiros por estado/região (natural para busca geográfica)
- **Por funcionalidade:** Tabelas SaaS em banco separado do diretório
- **Arquivo morto:** Terreiros inativos (>2 anos sem login) movidos para data warehouse

## Considerações de Migração e Versionamento

- Prisma Migrate com migrations versionadas (timestamp prefix)
- Seed data para categorias, estados, tradições
- Migration reversível (up/down)
- Testes de migração em CI/CD
- Backup automático pré-migration em produção
