# 37 — Política de Avaliações

## Princípios

1. **Avaliação é sobre a experiência, não sobre a fé.** O usuário avalia o acolhimento, organização, transparência — nunca a "qualidade espiritual".
2. **Transparência total.** Avaliações aprovadas são públicas e permanentes.
3. **Neutralidade.** Avaliações não podem favorecer ou atacar doutrinas.
4. **Responsabilidade.** Avaliador é responsável pelo conteúdo publicado.

## O que pode ser avaliado

| Pode | Não Pode |
|------|----------|
| Acolhimento do terreiro | Julgamento doutrinário ("essa casa não tem axé") |
| Organização da gira | Ataque pessoal ao dirigente |
| Clareza das informações | Discurso de ódio |
| Respeito aos visitantes | Informação falsa sobre rituais |
| Pontualidade dos eventos | Comparação depreciativa ("melhor que a casa X") |
| Infraestrutura (espaço, banheiros) | Promoção de outro terreiro |
| Qualidade do atendimento | Spam ou autopromoção |

## Regras de Criação

| Regra | Detalhe |
|-------|---------|
| Mínimo de caracteres | 20 caracteres no comentário |
| Máximo de caracteres | 2000 caracteres |
| Uma avaliação por terreiro | Cada usuário avalia cada terreiro 1 vez. Pode editar até 7 dias depois. |
| Período mínimo de conta | 7 dias para avaliar (anti-fraude) |
| Nota obrigatória | 1 a 5 estrelas |
| Título opcional | Máximo 100 caracteres |
| Fotos opcionais | Até 3 fotos por avaliação |

## Ciclo de Vida da Avaliação

```
Usuário escreve → Status: RASCUNHO
  → Usuário submete → Status: PENDENTE
    → Moderação (IA + Humana)
      → Aprovada → Status: PUBLICADA
        → Visível no perfil, recalcula Trust Score
      → Rejeitada → Status: REJEITADA
        → Não visível, usuário notificado com motivo
      → Sinalizada → Status: SINALIZADA
        → Outro usuário reportou → Revisão manual
```

## Direitos do Avaliador

| Direito | Descrição |
|---------|-----------|
| Editar | Pode editar avaliação até 7 dias após publicação |
| Excluir | Pode excluir a qualquer momento |
| Responder | Terreiro pode responder publicamente à avaliação |
| Reportar | Pode reportar avaliação de outro usuário |
| Recurso | Pode recorrer de moderação rejeitada em até 7 dias |

## Direitos do Terreiro

| Direito | Descrição |
|---------|-----------|
| Visualizar | Vê todas as avaliações recebidas |
| Responder | Pode responder publicamente cada avaliação (1 resposta) |
| Reportar | Pode reportar avaliação que viola as regras |
| Recurso | Pode recorrer se avaliação aprovada violar as regras |
| Bloquear? | NÃO — terreiro não pode bloquear avaliações (isso quebraria a confiança) |

## Política de Respostas

| Regra | Detalhe |
|-------|---------|
| Tempo para resposta | O terreiro pode responder a qualquer momento |
| Tom da resposta | Respeitoso, sem ataques pessoais |
| Exclusão de resposta | Terreiro pode editar/excluir sua resposta em até 7 dias |
| Moderação | Respostas também passam por moderação |

## Avaliações de Terreiros sem Plano (Grátis)

Terreiros no plano grátiz recebem avaliações normalmente. O Trust Score inclui avaliações independentemente do plano. Avaliações são um **direito da comunidade**, não um benefício pago.

## Regras Anti-Manipulação

| Tática | Bloqueio |
|--------|----------|
| **Avaliação em massa** | Múltiplas avaliações de contas novas no mesmo terreiro → sinaliza moderação |
| **Avaliação de retaliação** | Terreiro que incentiva membros a avaliarem negativamente outro terreiro → suspensão |
| **Autoavaliação** | Dirigente avaliando o próprio terreiro → avaliação removida, aviso |
| **Avaliação paga** | Oferecer benefício em troca de avaliação positiva → ambas as partes suspensas |
| **Avaliação falsa** | Usuário que nunca visitou avaliando → banimento |

## Métricas de Avaliações

| Métrica | Meta |
|---------|------|
| % avaliações aprovadas na primeira moderação | > 80% |
| Tempo médio de moderação | < 4h |
| % avaliações com resposta do terreiro | > 30% |
| % avaliações reportadas (sobre o total) | < 3% |
| Avaliações por terreiro (média) | > 10 |
| Avaliadores ativos/mês | > 10% dos usuários |
