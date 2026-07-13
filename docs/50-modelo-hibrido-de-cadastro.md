# 50 — Modelo Híbrido de Cadastro

## Filosofia

O AxéMap adota um modelo de cadastro **híbrido e colaborativo**, inspirado em Google Business, Airbnb e LinkedIn. Qualquer pessoa pode contribuir, mas a propriedade e verificação são protegidas.

## Os 4 Modos de Cadastro

```
MODO 1: Cadastro Colaborativo (Qualquer usuário)
  ├── Sugere nome, endereço, tradição
  ├── Status: Pendente
  ├── Não aparece como verificado
  └── Pode ser reivindicado pelo dirigente

MODO 2: Reivindicação de Perfil (Dirigente)
  ├── Solicita propriedade de perfil existente
  ├── Passa por validação documental
  ├── Após aprovação: torna-se owner
  └── Perfil ganha selo "Reivindicado"

MODO 3: Cadastro Oficial (Dirigente)
  ├── Dirigente cria perfil do zero
  ├── Já nasce como "Provisório"
  ├── Após validação: selo "Verificado"
  └── Maior pontuação no Trust Score

MODO 4: Cadastro Administrativo (Equipe AxéMap)
  ├── Criação em massa, fusão, correção
  ├── Usado para seed inicial e qualidade
  └── Auditado
```

## Fluxo Geral

```
                     ┌─────────────────────────┐
                     │  QUALQUER USUÁRIO        │
                     │  (colaborador)           │
                     └──────────┬──────────────┘
                                │ "Sugerir Terreiro"
                                ▼
                     ┌─────────────────────────┐
                     │  STATUS: PENDENTE        │
                     │  • Visível apenas para   │
                     │    admin + sugeridor     │
                     └──────────┬──────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
         ┌─────────────────┐    ┌─────────────────────┐
         │ Admin aprova    │    │ Admin rejeita        │
         │ (qualidade OK)  │    │ (duplicado, inválido)│
         └────────┬────────┘    └─────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ STATUS:          │
         │ PUBLICADO        │
         │ (não reivindicado)│
         │ Trust Score: 15  │
         └────────┬────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Dirigente    │   │ Ninguém          │
│ reivindica   │   │ reivindica       │
└──────┬───────┘   │ (perfil órfão)   │
       │           └──────────────────┘
       ▼
┌──────────────────┐
│ STATUS:           │
│ REIVINDICADO      │
│ (em verificação)  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Verificação documental│
├──────────────────────┤
│ Aprovado → VERIFICADO │
│ Rejeitado → EM REVISAO│
└──────────────────────┘
```

## Cadastro Colaborativo — Regras

| Regra | Detalhe |
|-------|---------|
| **Quem pode sugerir** | Qualquer usuário logado com conta > 7 dias |
| **Campos obrigatórios** | Nome, cidade, estado, tradição, WhatsApp |
| **Limite de sugestões** | 5 sugestões/dia por usuário (anti-spam) |
| **Moderação** | IA verifica duplicidade + dados básicos; admin aprova/rejeita |
| **Visibilidade** | Fica visível apenas para o sugeridor até aprovação |
| **Recompensa** | Sugeridor ganha 25 pontos de gamificação se aprovado |
| **Conflito** | Se terreiro já existe, sugeridor é redirecionado para o perfil existente |

## Reivindicação de Perfil — Regras

(Detalhado no documento 52)

## Cadastro Oficial — Regras

| Regra | Detalhe |
|-------|---------|
| **Quem pode** | Dirigente (usuário logado) |
| **Documentos necessários** | Identidade + comprovante de vínculo |
| **Tempo de aprovação** | Padrão: até 48h. Premium: até 4h |
| **Trust Score inicial** | 20 (vs 15 do colaborativo) |
| **Selo** | "Cadastro Oficial" após verificação |
| **Benefício** | Já nasce com possibilidade de reivindicar |

## Comparativo dos Modos

| Característica | Colaborativo | Reivindicado | Oficial | Admin |
|---------------|-------------|-------------|---------|-------|
| **Quem cria** | Qualquer usuário | Dirigente (perfil existente) | Dirigente | Equipe |
| **Trust Score inicial** | 15 | Mantém +5 bônus | 20 | 15 ou configurável |
| **Tempo até publicação** | 24-48h | 48h (verificação) | Imediato (provisório) | Imediato |
| **Pode ser editado por** | Admin | Dirigente + Admin | Dirigente + Admin | Admin |
| **Selo** | "Sugerido pela comunidade" | "Reivindicado" | "Verificado" | "Admin" |
| **Pode ser reivindicado** | Sim | N/A (já é do dirigente) | N/A | Sim (mas com aviso) |
| **Prioridade na busca** | Baixa | Média | Alta | Conforme config |

## Ciclo de Vida do Perfil (Simplificado)

```
RASCUNHO → PENDENTE → PUBLICADO → (reivindicação) → REIVINDICADO → VERIFICADO
                 ↘                        ↗ (admin corrige)
              REJEITADO → DUPLICADO → MESCLADO
                                              ↘
                                            SUSPENSO → ARQUIVADO
```

(Ver máquina de estados completa no documento 51)
