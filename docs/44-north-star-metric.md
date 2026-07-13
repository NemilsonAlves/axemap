# 44 — North Star Metric

## A North Star do AxéMap

> **"Conexões Confiáveis por Mês"**
> *(Trusted Connections per Month — TCPM)*

### Definição

Uma **Conexão Confiável** é definida como qualquer interação entre um usuário e um terreiro que atenda a DOIS critérios:

1. **O terreiro tem Trust Score mínimo de 30** (nível Estabelecido)
2. **O usuário realizou uma ação significativa** (ver critérios abaixo)

### Ações que Contam como "Conexão"

| Ação | Peso | Justificativa |
|------|------|---------------|
| **Clique no WhatsApp** | 1 conexão | Intenção de contato real |
| **Favoritou o terreiro** | 1 conexão | Interesse confirmado |
| **Avaliou o terreiro** | 2 conexões | Engajamento profundo |
| **Compartilhou o perfil** | 1 conexão | Recomendação ativa |
| **Cadastrou como membro (SaaS)** | 3 conexões | Vínculo formal |
| **Confirmou presença em evento** | 1 conexão | Intenção de visita |
| **Comprou no marketplace do terreiro** | 3 conexões | Transação financeira |

### Por que essa métrica?

| Requisito | Atende? | Por quê |
|-----------|---------|---------|
| **Reflete valor do produto** | ✅ | O valor é conectar pessoas a comunidades confiáveis |
| **Leva ao sucesso do cliente** | ✅ | Quanto mais conexões, mais satisfeito o usuário |
| **Influencia receita** | ✅ | Conexões → SaaS + Marketplace + Publicidade |
| **Acionável** | ✅ | Cada time pode otimizar uma alavanca |
| **Não é vaidade** | ✅ | Só conta conexões com Trust Score mínimo |
| **Simples de entender** | ✅ | "Quantas pessoas se conectaram com terreiros este mês?" |

### Metas

| Período | TCPM (Conexões Confiáveis por Mês) |
|---------|-----------------------------------|
| MVP (mês 3) | 1.000 |
| Tração (mês 6) | 25.000 |
| Crescimento (mês 12) | 100.000 |
| Escala (mês 24) | 1.000.000 |

### Alavancas da North Star

```
TCPM = (Usuários Ativos × Taxa de Conexão por Usuário × Trust Score Mínimo)

Alavancas:
  1. Aumentar Tráfego Qualificado (SEO, Ads, Conteúdo)
  2. Melhorar Taxa de Conexão (UX, Recomendação, Gamificação)
  3. Elevar Trust Score Médio (Onboarding, Verificação, Engajamento)
```

### Como a North Star guia decisões

| Decisão | Impacto na North Star |
|---------|----------------------|
| **Priorizar verificação de perfis** | Aumenta TCPM porque mais terreiros atingem score mínimo |
| **Melhorar busca semântica** | Aumenta taxa de conexão (acha terreiro certo mais rápido) |
| **Sistema de recomendações** | Aumenta taxa de conexão (match mais preciso) |
| **Gamificação de avaliadores** | Aumenta número de avaliações, elevando trust scores |
| **Onboarding de dirigentes** | Aumenta completeza, elevando trust scores |
| **Marketplace** | Conexões via transação (peso 3) |
| **Comunidade** | Aumenta retenção, mais oportunidades de conexão |

### Dashboard da North Star

```
┌─────────────────────────────────────────────────┐
│  North Star: Conexões Confiáveis por Mês        │
│  ┌─────────────────────────────────────────┐    │
│  │  ████████████████████░░░░░░░░░  1.247   │    │
│  │  Meta: 25.000  │  Progresso: 5%         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Componentes:                                   │
│  Usuários ativos no mês:   12.450               │
│  Taxa de conexão:          10%                  │
│  Terreiros com TS > 30:    45%                  │
│  Conexões totais:          1.247                │
│                                                 │
│  Top Conexões:                                  │
│  WhatsApp:       523 (42%)                      │
│  Favoritar:      312 (25%)                      │
│  Avaliar:        186 (15%)                      │
│  Compartilhar:   124 (10%)                      │
│  Evento:         62 (5%)                        │
│  Membro SaaS:    30 (2%)                        │
│  Marketplace:    10 (1%)                        │
└─────────────────────────────────────────────────┘
```

## Métricas Contrárias (Counter-metrics)

Para garantir que otimizar a North Star não leva a comportamentos ruins:

| Métrica | Por que monitorar | Limite de alerta |
|---------|-------------------|-----------------|
| **Denúncias de spam** | Gamificação excessiva pode gerar spam | > 5% das ações |
| **Trust Score de novos cadastros** | Cadastro de baixa qualidade | Média < 20 |
| **Taxa de rejeição de avaliações** | Moderação muito liberal | > 15% |
| **Tempo de resposta do suporte** | Crescimento sem suporte | > 4h |
