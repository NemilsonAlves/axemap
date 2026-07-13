# 55 — Estratégia de Crescimento Viral

## Os 5 Gatilhos Virais do AxéMap

### Gatilho 1: Compartilhar Perfil
**Mecanismo:** Usuário encontra terreiro e compartilha link no WhatsApp.
**Preview:** Open Graph rico (foto, avaliação, Trust Score, "Venha conhecer").
**Coeficiente estimado:** K = 0.3 (a cada 100 compartilhamentos, 30 novos visitantes).

```
Usuário → encontra terreiro → "Compartilhar" → WhatsApp
  → Amigo abre link → vê perfil → se interessa
    → Busca outro terreiro → ciclo continua
```

**Alavancas:**
- Open Graph com foto do terreiro + Trust Score visível
- "Compartilhe com quem pode se interessar"
- Botão flutuante no perfil

### Gatilho 2: Convite de Terreiro
**Mecanismo:** Visitante não encontra terreiro → "Conhece um terreiro que não está aqui?"
**Coeficiente estimado:** K = 0.2

```
Visitante busca → não encontra → "Sugerir terreiro"
  → Preenche nome + WhatsApp → AxéMap convida o dirigente
    → Dirigente se cadastra → terreiro na plataforma
```

**Alavancas:**
- Sugerir é mais rápido que cadastrar (só 3 campos)
- Sugeridor ganha pontos de gamificação
- Dirigente recebe convite personalizado

### Gatilho 3: Avaliação Compartilhável
**Mecanismo:** Usuário avalia terreiro e pode compartilhar a avaliação.
**Coeficiente estimado:** K = 0.15

```
Usuário avalia terreiro → "Compartilhe sua avaliação"
  → Posta no Instagram/WhatsApp → amigos veem
    → Amigos curiosos visitam a plataforma
```

**Alavancas:**
- Card personalizado com nota + foto + "Avaliei no AxéMap"
- Compartilhamento automático pós-avaliação (opt-in)
- Hashtag #AxéMap

### Gatilho 4: Convite de Usuário
**Mecanismo:** Usuário convida amigo para se cadastrar.
**Coeficiente estimado:** K = 0.1

```
Usuário → "Convide um amigo" → link personalizado
  → Amigo se cadastra → ambos ganham pontos
```

**Alavancas:**
- Bônus para quem convida (50 pts de gamificação)
- Bônus para quem é convidado (25 pts)
- Ranking de embaixadores

### Gatilho 5: Evento Compartilhável
**Mecanismo:** Usuário confirma presença em evento e compartilha.
**Coeficiente estimado:** K = 0.4 (maior de todos)

```
Usuário → "Vou neste evento" → compartilha automaticamente
  → Amigos veem → se interessam → também confirmam
    → Efeito "Todo mundo vai"
```

**Alavancas:**
- "Confirmar presença" compartilha automaticamente (opt-in)
- Lembrete do evento com link para a plataforma
- "Fulano vai neste evento" (prova social)

## Coeficiente Viral Total

```
K_total = K_share + K_suggest + K_review + K_invite + K_event

K_total ≈ 0.3 + 0.2 + 0.15 + 0.1 + 0.4 = 1.15

Interpretação:
- K < 1: crescimento morre com o tempo (precisa de marketing pago)
- K = 1: crescimento linear (sustentável)
- K > 1: crescimento exponencial (viral)

Com K = 1.15, cada usuário traz ~1.15 novos usuários → crescimento viral.
```

## Ciclo Viral

```
Tempo do ciclo viral: ~48h (descoberta → compartilhamento → amigo descobre)

Crescimento estimado:
  Semana 1: 100 usuários
  Semana 2: 100 × 1.15^3.5 ≈ 170 usuários
  Semana 4: 100 × 1.15^7 ≈ 260 usuários
  Semana 8: 100 × 1.15^14 ≈ 710 usuários
  Semana 16: 100 × 1.15^28 ≈ 5.700 usuários
```

## Estratégias para Aumentar K

| Alavanca | Aumento Estimado | Esforço |
|----------|-----------------|---------|
| Melhorar Open Graph (foto + score) | K + 0.1 | Baixo |
| Compartilhamento pós-avaliação automático | K + 0.05 | Médio |
| Convite com benefício mútuo | K + 0.1 | Médio |
| Evento: "fulano vai" + notificação | K + 0.15 | Alto |
| Programa de embaixadores com selo | K + 0.05 | Médio |
| Conteúdo compartilhável (calendário, guias) | K + 0.08 | Alto |

**K potencial com todas alavancas:** 1.15 + 0.53 = **1.68**

## Limitações e Riscos

| Risco | Mitigação |
|-------|-----------|
| **Cansaço viral** (usuários ignoram convites) | Variar gatilhos, não saturar |
| **Spam** (compartilhamento excessivo) | Limite de compartilhamentos/dia |
| **Qualidade vs quantidade** (muitos usuários de baixa qualidade) | Trust Score + moderação |
| **Efeito sazonal** (menos compartilhamento em épocas específicas) | Campanhas sazonais |
