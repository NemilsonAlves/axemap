# 51 — Máquina de Estados dos Perfis

## Diagrama de Estados

```
                    ┌──────────┐
                    │ RASCUNHO │ (1)
                    └────┬─────┘
                         │ submete
                         ▼
                   ┌──────────┐
              ┌───▶│ PENDENTE │ (2)
              │    └────┬─────┘
              │         │
         ┌────┴───┐   ┌─┴──────────┐
         │        │   │            │
         ▼        │   ▼            ▼
   ┌─────────┐    │ ┌────────┐ ┌──────────┐
   │REJEITADO│    │ │PUBLICADO│ │DUPLICADO│ (3)  (4)
   │   (5)   │    │ │   (6)   │ └────┬─────┘
   └────┬────┘    │ └────┬────┘      │
        │         │      │          ▼
        │    ┌────┘      │     ┌──────────┐
        │    │           │     │ MESCLADO │ (7)
        │    │           │     └──────────┘
        ▼    ▼           │
     ┌──────────┐        │
     │ARQUIVADO │        │
     │   (8)    │        │
     └──────────┘        │
                         ▼
                    ┌──────────────┐
                    │ EM REVISAO   │ (9)
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
              ┌──────────┐ ┌────────────┐
              │REIVINDIC │ │ SUSPENSO   │
              │   (10)   │ │   (11)     │
              └────┬─────┘ └─────┬──────┘
                   │             │
                   ▼             │
              ┌──────────┐       │
              │VERIFICADO│       │
              │   (12)   │       │
              └────┬─────┘       │
                   │             │
              ┌────┴────┐        │
              │         │        │
              ▼         │        ▼
        ┌─────────┐     │   ┌──────────┐
        │PUBLICADO│     │   │ARQUIVADO │
        │(reativar)│    │   │   (8)    │
        └─────────┘     │   └──────────┘
                        │
                        ▼
                   ┌──────────┐
                   │PUBLICADO │
                   │(reativar)│
                   └──────────┘
```

## Tabela de Estados

| ID | Estado | Descrição | Visível na busca? | Editável por | Duração Máxima |
|----|--------|-----------|-------------------|-------------|----------------|
| 1 | **Rascunho** | Cadastro iniciado mas não submetido | ❌ | Criador (qualquer modo) | 30 dias |
| 2 | **Pendente** | Aguardando aprovação administrativa | ❌ | Admin | 48h |
| 3 | **Rejeitado** | Não atendeu critérios de qualidade | ❌ | Admin (pode reverter) | — |
| 4 | **Duplicado** | Identificado como duplicata de outro perfil | ❌ | Admin | Até mesclagem |
| 5 | **Mesclado** | Perfil foi mesclado a outro (dados preservados) | ❌ (redirect) | N/A | Permanente |
| 6 | **Publicado** | Visível na plataforma (não reivindicado) | ✅ | Admin | Indeterminado |
| 7 | **Em Revisão** | Reivindicação ou denúncia em análise | ✅ (com aviso) | Admin | 48h |
| 8 | **Arquivado** | Perfil inativado (solicitação do dirigente ou inatividade > 1 ano) | ❌ | Admin | Permanente |
| 9 | **Reivindicado** | Dirigente solicitou propriedade, aguardando verificação | ✅ (selo "reivindicação pendente") | Admin + Dirigente (parcial) | 7 dias |
| 10 | **Verificado** | Dirigente confirmado, perfil oficial | ✅ (selo verificado) | Dirigente + Admin | Indeterminado |
| 11 | **Suspenso** | Violação de termos identificada | ❌ | Admin | Conforme gravidade |

## Transições Permitidas

| De | Para | Gatilho | Ações |
|----|------|---------|-------|
| **RASCUNHO** | **PENDENTE** | Usuário submete formulário | Notificar admin, IA check inicial |
| **RASCUNHO** | **ARQUIVADO** | 30 dias sem submissão | Notificar usuário |
| **PENDENTE** | **PUBLICADO** | Admin aprova | Notificar criador, calcular Trust Score inicial |
| **PENDENTE** | **REJEITADO** | Admin rejeita | Notificar com motivo |
| **PENDENTE** | **DUPLICADO** | IA ou admin identifica duplicata | Notificar, preparar mesclagem |
| **DUPLICADO** | **MESCLADO** | Admin confirma mesclagem | Preservar histórico, redirect |
| **PUBLICADO** | **EM REVISAO** | Usuário solicita reivindicação | Notificar admin, bloquear edições |
| **PUBLICADO** | **SUSPENSO** | Denúncia confirmada ou violação | Notificar dirigente (se houver), remover da busca |
| **PUBLICADO** | **ARQUIVADO** | Inatividade > 12 meses ou solicitação | Notificar, backup |
| **EM REVISAO** | **REIVINDICADO** | Documentos OK, admin aprova | Conceder propriedade, selo "Reivindicado" |
| **EM REVISAO** | **PUBLICADO** | Reivindicação rejeitada | Notificar solicitante |
| **EM REVISAO** | **SUSPENSO** | Documentos falsos detectados | Banir solicitante, manter perfil |
| **REIVINDICADO** | **VERIFICADO** | Verificação documental completa | Conceder selo, aumentar Trust Score |
| **REIVINDICADO** | **PUBLICADO** | Verificação expirou (7 dias sem documentos) | Perder selo de reivindicação |
| **VERIFICADO** | **SUSPENSO** | Denúncia confirmada | Remover da busca, notificar |
| **VERIFICADO** | **PUBLICADO** | Dirigente renuncia à propriedade | Remover selos, perfil órfão |
| **SUSPENSO** | **PUBLICADO** | Período de suspensão expirou ou recurso aceito | Restaurar visibilidade |
| **SUSPENSO** | **ARQUIVADO** | Suspensão definitiva | Backup + arquivamento |
| **REJEITADO** | **PENDENTE** | Novo cadastro com correções | Recomeçar ciclo |

## Regras de Negócio das Transições

### Regra 1: Mesclagem
- Perfil DUPLICADO é redirecionado permanentemente para o perfil principal
- Avaliações, fotos e eventos do perfil duplicado são migrados
- Trust Score do perfil principal é recalculado (incremento mínimo de +1 por fusão)
- Sugeridor original recebe notificação e crédito de gamificação

### Regra 2: Suspensão
- 1ª suspensão: 7 dias (recuperável automaticamente)
- 2ª suspensão: 30 dias (recuperável após recurso)
- 3ª suspensão: Definitiva (arquivamento)
- Cada suspensão gera registro em `sinalizacoes_trust`

### Regra 3: Arquivamento por Inatividade
- Trigger: 12 meses sem login do dirigente
- Notificações: 30, 15, 7 e 1 dia antes
- Perfil arquivado pode ser reativado pelo dirigente (volta a PUBLICADO)
- Após 2 anos arquivado: dados anonimizados (LGPD)

### Regra 4: Reivindicação
- Qualquer perfil PUBLICADO pode ser reivindicado
- Se já tem dirigente, solicitação vai para mediação
- Dirigente tem 7 dias para enviar documentos
- Se não enviar, perfil volta a PUBLICADO

## Eventos Associados às Transições

| Transição | Evento de Domínio |
|-----------|------------------|
| PENDENTE → PUBLICADO | TerreiroPublicado |
| PUBLICADO → EM REVISAO | ReivindicacaoSolicitada |
| EM REVISAO → REIVINDICADO | ReivindicacaoAprovada |
| REIVINDICADO → VERIFICADO | TerreiroVerificado |
| PUBLICADO → SUSPENSO | TerreiroSuspenso |
| SUSPENSO → PUBLICADO | TerreiroRestaurado |
| PUBLICADO → ARQUIVADO | TerreiroArquivado |
| DUPLICADO → MESCLADO | TerreiroMesclado |

## Visualização para o Admin

```
┌─────────────────────────────────────────────────┐
│  Gerenciar Terreiros                            │
│                                                 │
│  [Pendentes (12)] [Denúncias (3)] [Suspensos (2)]│
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Terreiro Pai João — Recife              │    │
│  │ Status: 🔵 PENDENTE                     │    │
│  │ Sugerido por: Carla S. (25/06/2026)     │    │
│  │ [Aprovar] [Rejeitar] [Marcar Duplicata] │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ Terreiro Mãe Maria — Salvador           │    │
│  │ Status: 🟡 EM REVISAO                   │    │
│  │ Reivindicado por: Pai Ricardo           │    │
│  │ Documentos recebidos ✓                  │    │
│  │ [Aprovar] [Solicitar + docs] [Recusar]  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```
