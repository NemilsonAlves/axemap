# 52 — Fluxo de Reivindicação de Perfil

## Visão Geral

O fluxo de reivindicação permite que um dirigente **assuma a propriedade** de um perfil de terreiro que já existe na plataforma (cadastrado colaborativamente por outro usuário ou pela equipe).

## Trigger do Fluxo

```
Usuário busca por "Terreiro Pai João"
  → Encontra o perfil
  → Vê que NÃO é verificado (selo "Sugerido pela comunidade")
  → Clica em "É o dirigente? Reivindique este perfil!"
```

## Etapas do Fluxo

### Etapa 1: Solicitação

```
[Dirigente] clica "Reivindicar Perfil"
  → Login (ou cadastro) obrigatório
  → Confirma: "Você confirma que é o dirigente responsável por este terreiro?"
  → [Página de Termos]
    → "Ao reivindicar, você confirma que as informações são verdadeiras..."
    → "Dados falsos podem resultar em suspensão da sua conta."
    → Checkbox: "Li e concordo"
  → [Formulário]
    → Nome completo do dirigente
    → Cargo (pai de santo, mãe de santo, dirigente)
    → Telefone para contato (validação via SMS/WhatsApp)
    → Relação com o terreiro (texto livre)
  → [Submit] → Status: "Solicitação enviada"
```

### Etapa 2: Verificação

```
[Admin] recebe notificação
  → Acessa fila de verificação
  → Vê:
    ┌──────────────────────────────────────────┐
    │  Reivindicação Pendente                  │
    │                                          │
    │  Terreiro: Terreiro Pai João             │
    │  Solicitante: José Santos (jose@email)   │
    │  Cargo declarado: Pai de Santo           │
    │  Contato: (81) 99999-9999                │
    │  │
    │  [Documentos enviados]                   │
    │  ├── RG (frente/verso)                    │
    │  ├── Selfie com documento                │
    │  └── Declaração de vínculo (foto na      │
    │       casa, documento da federação, etc.) │
    │                                          │
    │  [Ações]                                 │
    │  ✅ Aprovar Reivindicação                │
    │  ❌ Solicitar mais documentos            │
    │  🚫 Recusar (com motivo)                 │
    └──────────────────────────────────────────┘
```

### Etapa 3: Resolução

```
[Aprovado]
  → Perfil muda para status REIVINDICADO
  → Solicitante vira owner do perfil
  → Selo "Reivindicado" adicionado ao perfil
  → Trust Score: +5 pontos (bônus de reivindicação)
  → Notificação ao solicitante: "Parabéns! Agora você é o responsável por [Terreiro] no AxéMap."
  → Sugeridor original recebe: "O terreiro que você sugeriu foi reivindicado!"
  → [Opcional] Iniciar verificação Nível 3 (identidade)

[Documentos insuficientes]
  → Admin solicita documentos adicionais
  → Notificação ao solicitante com lista do que falta
  → Prazo: 7 dias para enviar
  → Se não enviar em 7 dias, solicitação expira

[Recusado]
  → Notificação ao solicitante com motivo
  → Possibilidade de recurso (48h)
  → Perfil volta a PUBLICADO
```

### Etapa 4: Pós-Reivindicação

```
[Dirigente agora é owner]
  → Acessa painel do terreiro
  → Pode editar todas as informações
  → Pode solicitar verificação Nível 3 (identidade)
  → Pode gerenciar membros (se tiver plano)
  → Recebe notificações de novas avaliações
  → Pode responder avaliações

  Sugestão de onboarding pós-reivindicação:
  1. "Complete seu perfil para aumentar o Trust Score"
  2. "Adicione fotos reais do terreiro"
  3. "Publique seu primeiro evento"
  4. "Convide membros da casa"
  5. "Verifique sua identidade para ganhar o selo Verificado"
```

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Uma conta = um terreiro?** | Uma conta pode ser owner de MULTIPLOS terreiros (dirigente de mais de uma casa) |
| **Tempo mínimo de conta** | Usuário precisa ter conta há pelo menos 7 dias para reivindicar |
| **Conflito entre solicitantes** | Se dois usuários reivindicam o mesmo terreiro, admin media |
| **Reivindicação anterior** | Se já foi reivindicado antes, novo dirigente precisa de autorização do anterior OU comprovação de sucessão |
| **Sucessão espiritual** | Caso o dirigente anterior tenha falecido ou passado a casa, novo dirigente envia documentação de sucessão |
| **Falso positiva** | Se o admin aprova por engano, pode reverter em até 7 dias |

## Notificações do Fluxo

| Momento | Quem recebe | Canal |
|---------|------------|-------|
| Solicitação enviada | Solicitante | Email + WhatsApp |
| Documentos pendentes | Admin | Notificação interna |
| Aprovação | Solicitante + Sugeridor original | Email + WhatsApp + Push |
| Documentos insuficientes | Solicitante | Email + WhatsApp |
| Recusa | Solicitante | Email + motivo |
| Expirada (7 dias) | Solicitante | Email |
| Lembrete 48h | Admin | Notificação interna |

## Métricas do Fluxo

| Métrica | Meta |
|---------|------|
| Tempo médio entre solicitação e aprovação | < 24h |
| Taxa de aprovação na primeira tentativa | > 70% |
| % de perfis reivindicados (sobre o total publicado) | > 30% |
| Satisfação do dirigente pós-reivindicação (NPS) | > 60 |
| Recursos de recusa | < 5% |
