# 56 — Governança dos Dados

## Princípios

1. **Toda alteração tem dono** — Toda modificação em dados deve ser atribuída a um ator
2. **Nada se perde** — Histórico completo de alterações é preservado
3. **Dados sensíveis são protegidos** — Religião, documentos, localização exata têm tratamento especial
4. **Acesso mínimo necessário** — Cada papel só acessa o que precisa

## Matriz de Propriedade dos Dados

### Dados Públicos (visíveis na busca/perfil)

| Campo | Quem cria | Quem edita | Quem vê | Auditado? |
|-------|-----------|-----------|---------|-----------|
| Nome do terreiro | Qualquer modo | Dirigente + Admin | Todos | ✅ |
| Tradição religiosa | Qualquer modo | Dirigente + Admin | Todos | ✅ |
| Descrição | Dirigente + Admin | Dirigente + Admin | Todos | ✅ |
| Fotos | Dirigente + Admin | Admin (remover) | Todos | ✅ |
| Horários | Dirigente + Admin | Dirigente + Admin | Todos | ✅ |
| Endereço (rua, bairro) | Qualquer modo | Dirigente + Admin | Todos | ✅ |
| Eventos | Dirigente + Admin | Dirigente + Admin | Todos | ✅ |
| Avaliações | Usuário | Usuário (7 dias) | Todos | ✅ |
| Trust Score | Sistema | Sistema (automático) | Todos | ✅ |
| Selos de verificação | Sistema + Admin | Admin | Todos | ✅ |

### Dados Privados (visíveis apenas para o dirigente + equipe)

| Campo | Quem cria | Quem edita | Quem vê | Auditado? |
|-------|-----------|-----------|---------|-----------|
| Documentos de identidade | Dirigente (upload) | Admin | Admin verificação | ✅ |
| Número de WhatsApp (privado) | Dirigente | Dirigente | Dirigente + Admin | ✅ |
| Email do dirigente | Dirigente | Dirigente | Dirigente + Admin | ✅ |
| Financeiro (doações, receitas) | Dirigente + Sistema | Dirigente | Dirigente + Admin | ✅ |
| Membros do terreiro | Dirigente | Dirigente | Dirigente + Admin | ✅ |
| Métricas internas | Sistema | — | Dirigente + Admin | ✅ |

### Dados Administrativos (apenas equipe AxéMap)

| Campo | Quem cria | Quem edita | Quem vê | Auditado? |
|-------|-----------|-----------|---------|-----------|
| Flag de verificação | Admin | Admin | Admin | ✅ |
| Motivo de suspensão | Admin | Admin | Admin + Usuário | ✅ |
| Notas internas | Admin | Admin | Admin | ✅ |
| Status de moderação | Admin + IA | Admin | Admin + Usuário | ✅ |
| IPs e logs de acesso | Sistema | — | Admin (LGPD) | ✅ |

## Regras de Edição por Estado do Perfil

| Estado | Quem pode editar o quê |
|--------|-----------------------|
| **RASCUNHO** | Criador: tudo. Admin: tudo. |
| **PENDENTE** | Admin: tudo. Criador: nada (bloqueado). |
| **PUBLICADO** | Admin: tudo. Criador/sugeridor: nada (perfil órfão). Dirigente (se reivindicou): tudo. |
| **REIVINDICADO** | Dirigente: perfil, fotos, horários, eventos. Admin: tudo. |
| **VERIFICADO** | Dirigente: perfil, fotos, horários, eventos, membros. Admin: tudo (com notificação). |
| **EM REVISAO** | Admin: tudo. Dirigente: só pode adicionar documentos. |
| **SUSPENSO** | Admin: tudo. Dirigente: só recurso. |
| **DUPLICADO** | Admin: tudo (preparar mesclagem). |
| **ARQUIVADO** | Admin: reativar. Ninguém mais. |

## Mecanismo de Auditoria

Toda alteração em campos críticos gera:

```json
{
  "tabela": "terreiros",
  "registro_id": "uuid-do-terreiro",
  "acao": "UPDATE",
  "campos_alterados": {
    "nome": { "antes": "Terreiro Pai João", "depois": "Terreiro Pai João de Oxalá" },
    "descricao": { "antes": "...", "depois": "..." }
  },
  "alterado_por": {
    "usuario_id": "uuid",
    "papel": "dirigente",
    "ip": "189.xxx.xxx.xxx"
  },
  "metadados": {
    "estado_perfil": "verificado",
    "sessao_id": "uuid-da-sessao",
    "user_agent": "Mozilla/5.0..."
  },
  "timestamp": "2026-07-13T15:00:00Z"
}
```

## Política de Retenção de Dados

| Tipo de Dado | Retenção | Exclusão |
|-------------|----------|----------|
| Dados de perfil (públicos) | Indeterminada (enquanto perfil existir) | Solicitação do dirigente + LGPD |
| Dados de perfil (privados) | Indeterminada | Dirigente pode remover |
| Documentos de identidade | 90 dias após verificação | Automática (criptografada) |
| Avaliações | Indeterminada (permanentes) | Avaliador pode excluir |
| Logs de auditoria | 5 anos | Automática (anônima após 5 anos) |
| Sessões | 7 dias após expiração | Automática |
| Dados de pagamento | 5 anos (fiscal) | Conforme Lei |
| Dados de usuário deletado | 30 dias (período de arrependimento) | Exclusão total após 30 dias |

## Privacidade Diferencial por Papel

| Papel | Vê dados de terreiros | Vê dados de usuários | Vê dados financeiros | Vê documentos |
|-------|----------------------|---------------------|---------------------|--------------|
| **Visitante** | Públicos | — | — | — |
| **Usuário** | Públicos | Próprios | — | — |
| **Dirigente** | Públicos + próprios privados | Próprios | Próprios | Próprios |
| **Moderador** | Públicos + denúncias | Anônimos | — | — |
| **Admin** | Todos | Todos (LGPD) | Agregados | Temporário |
| **Super Admin** | Todos | Todos | Todos | Todos (auditado) |

## Ciclo de Vida do Dado

```
CRIAÇÃO → ARMAZENAMENTO → USO → ARQUIVAMENTO → EXCLUSÃO
  │           │             │         │             │
  │           │             │         └── Após 5    │
  │           │             │             anos de   │
  │           │             │             inativi-  │
  │           │             │             dade      │
  │           │             │                       │
  │           │             └── Consultas,          │
  │           │                 auditoria,          │
  │           │                 recalculo           │
  │           │                                     │
  │           └── Criptografia AES-256              │
  │               (dados sensíveis)                 │
  │                                                 │
  └── Validação +                                   
      Consentimento LGPD                           
```
