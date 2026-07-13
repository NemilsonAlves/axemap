# 57 — Permissões e Papéis (RBAC Completo)

## Hierarquia de Papéis

```
Super Admin
    └── Admin AxéMap
          ├── Moderador
          │     └── Curador Voluntário
          ├── Suporte
          ├── Verificador
          └── Analista de Dados
                └── (API externa)

Dirigente (owner de terreiro)
    ├── Co-Admin (membro do terreiro com permissões administrativas)
    ├── Ogã (acesso restrito à agenda)
    ├── Ekedi (acesso restrito)
    ├── Filho de Santo (acesso limitado)
    └── Membro (visualização)

Usuário Comum
    ├── Visitante (não logado)
    └── Praticante (logado)
          └── Embaixador (logado + programa de indicação)
```

## Matriz de Permissões

### Permissões de Sistema

| Ação | Super Admin | Admin | Moderador | Curador | Suporte | Verificador |
|------|------------|-------|-----------|---------|---------|-------------|
| Criar admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver todos os dados | ✅ | ✅ | Parcial | ❌ | Parcial | Parcial |
| Modificar qualquer perfil | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Excluir perfil | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Moderar avaliações | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Moderar conteúdo | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprovar verificação | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Suspender terreiro | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suspender usuário | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mesclar perfis | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver logs auditoria | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver dashboard financeiro | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exportar dados | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Ver documentos | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (temporário) |

### Permissões do Terreiro

| Ação | Dirigente | Co-Admin | Ogã | Ekedi | Filho Santo | Membro |
|------|-----------|----------|-----|-------|-------------|--------|
| Editar perfil | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gerenciar membros | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publicar eventos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver finanças | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver agenda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responder avaliações | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Convidar membros | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver membros | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver documentos | ✅ | Parcial | ❌ | ❌ | ❌ | ❌ |
| Excluir terreiro | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Solicitar verificação | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fazer upgrade plano | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões do Usuário Comum

| Ação | Visitante | Praticante | Embaixador |
|------|-----------|------------|------------|
| Buscar terreiros | ✅ | ✅ | ✅ |
| Ver perfil | ✅ | ✅ | ✅ |
| Avaliar terreiro | ❌ | ✅ | ✅ |
| Favoritar | ❌ | ✅ | ✅ |
| Compartilhar | ✅ | ✅ | ✅ |
| Sugerir terreiro | ❌ | ✅ | ✅ |
| Reivindicar perfil | ❌ | ✅ | ✅ |
| Criar post (comunidade) | ❌ | ✅ | ✅ |
| Reportar conteúdo | ❌ | ✅ | ✅ |
| Ver quem está online | ❌ | ❌ | ✅ |
| Participar de programa de embaixadores | ❌ | ❌ | ✅ |

## Definição dos Papéis

### Papéis de Sistema

| Papel | Descrição | Acesso a Dados Sensíveis |
|-------|-----------|-------------------------|
| **Super Admin** | Fundador/CTO. Acesso irrestrito para operações críticas. | Total |
| **Admin AxéMap** | Equipe full-time. Gerencia operações diárias. | Total |
| **Moderador** | Aprova/rejeita conteúdo. Não vê dados financeiros. | Parcial |
| **Curador Voluntário** | Membro da comunidade experiente que ajuda na moderação. | Mínimo |
| **Suporte** | Atende usuários. Pode ver dados para resolver problemas. | Parcial |
| **Verificador** | Aprova documentação de identidade. Acesso temporário. | Temporário |

### Papéis de Terreiro

| Papel | Descrição | Nomeação |
|-------|-----------|----------|
| **Dirigente** | Owner do perfil. Controle total sobre o terreiro na plataforma. | Auto-cadastro ou reivindicação |
| **Co-Admin** | Auxiliar do dirigente com permissões administrativas. | Dirigente nomeia |
| **Ogã** | Responsável musical. Acesso à agenda de giras. | Dirigente nomeia |
| **Ekedi** | Cuidador dos Orixás. Acesso a agenda. | Dirigente nomeia |
| **Filho de Santo** | Membro iniciado no terreiro. Acesso limitado. | Dirigente nomeia |
| **Membro** | Frequentador não iniciado. Acesso mínimo. | Dirigente nomeia |

### Papéis de Usuário

| Papel | Descrição | Requisito |
|-------|-----------|-----------|
| **Visitante** | Não logado. Apenas busca e visualização. | Nenhum |
| **Praticante** | Logado. Pode interagir (avaliar, favoritar, sugerir). | Email confirmado |
| **Embaixador** | Usuário que promove a plataforma. Benefícios exclusivos. | 10+ convites bem-sucedidos |

## RBAC no Banco de Dados

```sql
-- Tabela de papéis
CREATE TABLE papeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  nivel INTEGER NOT NULL, -- 1=visitante, 10=super_admin
  is_sistema BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de permissões
CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurso VARCHAR(100) NOT NULL, -- 'terreiro.editar', 'avaliacao.moderar'
  acao VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve'
  descricao TEXT,
  UNIQUE(recurso, acao)
);

-- Relação papel-permissão
CREATE TABLE papeis_permissoes (
  papel_id UUID REFERENCES papeis(id) ON DELETE CASCADE,
  permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (papel_id, permissao_id)
);

-- Papéis do usuário no sistema
CREATE TABLE usuarios_papeis (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  papel_id UUID REFERENCES papeis(id) ON DELETE CASCADE,
  terreiro_id UUID REFERENCES terreiros(id) ON DELETE CASCADE, -- NULL para papéis globais
  atribuido_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, papel_id, terreiro_id)
);
```

## Verificação de Permissão (Pseudocódigo)

```typescript
async function checkPermission(
  userId: string,
  resource: string,    // 'terreiro.editar'
  action: string,      // 'update'
  context?: {          // contexto opcional
    terreiroId?: string;
  }
): Promise<boolean> {
  // 1. Super admin sempre passa
  if (await isSuperAdmin(userId)) return true;

  // 2. Busca papéis do usuário
  const papeis = await getUsuarioPapeis(userId, context?.terreiroId);

  // 3. Verifica se algum papel tem a permissão
  for (const papel of papeis) {
    const temPermissao = await checkPermissao(papel.id, resource, action);
    if (temPermissao) return true;
  }

  return false;
}
```
