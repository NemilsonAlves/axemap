# 16 — Estratégia de Monetização

## Pilares de Receita

O AxéMap terá **5 pilares de receita** com maturação em fases diferentes:

```
Receita Total = SaaS + Marketplace + Destaques + Publicidade + Enterprise
```

## 1. SaaS — Planos de Assinatura para Terreiros (MRR)

| Plano | Preço | % Base Esperada (12 meses) | Receita Projetada |
|-------|-------|---------------------------|-------------------|
| Gratuito | R$ 0 | 80% (4.000 terreiros) | R$ 0 |
| Básico | R$ 49/mês | 12% (600 terreiros) | R$ 29.400/mês |
| Profissional | R$ 99/mês | 6% (300 terreiros) | R$ 29.700/mês |
| Enterprise | R$ 299/mês | 2% (100 terreiros) | R$ 29.900/mês |
| **Total SaaS** | | **5.000 terreiros** | **R$ 89.000/mês** |

### Upgrade Drivers
- **Gratuito → Básico:** Quando precisa de agenda e controle de membros
- **Básico → Profissional:** Quando quer subdomínio, membros ilimitados e financeiro
- **Profissional → Enterprise:** Múltiplos terreiros, API privada, white-label

## 2. Marketplace — Comissão sobre Vendas

| Modelo | Taxa | Exemplo | Receita | Margem |
|--------|------|---------|---------|--------|
| Comissão sobre venda | 12% | Vela R$ 15 → R$ 1,80 | Líquido | Alta |
| Taxa fixa por pedido | R$ 2,00 | Processamento | Fixa | Cobertura Stripe |
| Destaque de produto | R$ 29/mês | Posição no topo da categoria | Recorrente | Altíssima |

**Projeção:** 500 pedidos/mês × ticket médio R$ 80 × 12% = R$ 4.800/mês (ano 1)
**Projeção ano 2:** 5.000 pedidos/mês × R$ 80 × 12% = R$ 48.000/mês

## 3. Listings Premium (Destaque no Diretório)

| Tipo | Preço | Descrição |
|------|-------|-----------|
| Destaque por mês | R$ 29/mês | Aparece no topo da busca local |
| Verificado | R$ 49 (único) | Selo de verificação no perfil |
| Super Destaque | R$ 99/mês | Primeiro resultado da cidade + destaque na homepage |

**Projeção:** 200 terreiros × R$ 29/mês = R$ 5.800/mês

## 4. Publicidade Segmentada

| Formato | Preço Estimado | Público |
|---------|---------------|---------|
| Banner Homepage | R$ 1.500/mês | Visitantes |
| Card patrocinado na busca | R$ 800/mês | Praticantes |
| Anúncio em newsletter | R$ 500/mês | Praticantes engajados |
| Patrocínio de categoria (ex: "velas") | R$ 2.000/mês | Compradores |

**Projeção:** R$ 5.000-15.000/mês (ano 2, com tráfego estabelecido)

## 5. Enterprise — Licenciamento de Dados

| Produto | Preço | Cliente |
|---------|-------|---------|
| API Pública (pesquisa) | Grátis (com atribuição) | Universidades |
| API Privada (governo) | R$ 1.500-5.000/mês | Prefeituras, Ministérios |
| Dados Agregados | R$ 10.000-50.000 (projeto) | ONGs, Fundações |
| Mapa da Intolerância | R$ 2.000/mês | Órgãos públicos |

**Projeção:** R$ 10.000-30.000/mês (ano 2-3)

## 6. Eventos — Taxas e Ingressos

| Serviço | Taxa | Projeção |
|---------|------|----------|
| Taxa de ingresso | 5% + R$ 1,00 | Ano 2 |
| Divulgação paga de evento | R$ 19/evento | Ano 2 |
| Ingresso solidário (doação) | 2% (menor para incentivar) | Ano 2 |

**Projeção:** R$ 2.000-8.000/mês (ano 2)

## Projeção Consolidada de Receita

| Pilar | Mês 6 | Mês 12 | Mês 24 | Mês 36 |
|-------|-------|--------|--------|--------|
| SaaS | R$ 8k | R$ 89k | R$ 350k | R$ 800k |
| Marketplace | R$ 0 | R$ 5k | R$ 48k | R$ 200k |
| Listings | R$ 1k | R$ 6k | R$ 25k | R$ 60k |
| Publicidade | R$ 0 | R$ 2k | R$ 15k | R$ 40k |
| Enterprise | R$ 0 | R$ 0 | R$ 15k | R$ 50k |
| Eventos | R$ 0 | R$ 1k | R$ 8k | R$ 30k |
| **Total MRR** | **R$ 9k** | **R$ 103k** | **R$ 461k** | **R$ 1.180M** |

## Estratégia de Precificação

**Freemium agressivo:** O plano gratuito é generoso o suficiente para atrair e reter terreiros. A conversão acontece por dor (agenda lotada, muitos membros, necessidade de profissionalização).

**Preço justo:** Valores abaixo do mercado (AxéCloud e I❤️Macumba cobram R$ 159-200) porque ganhamos em volume e ecossistema. Nosso plano Básico de R$ 49 é um terço do concorrente.

**Transparência de preços:** Todos os preços públicos, sem "consultar". Gera confiança.

## Métricas de Monetização

| Métrica | Meta | Fórmula |
|---------|------|---------|
| MRR | R$ 100k (mês 12) | Receita recorrente mensal |
| ARPU | R$ 45/mês | Receita total / terreiros pagantes |
| Chrate | < 5%/mês | Cancelamentos / total pagantes |
| LTV | R$ 2.700 (5 anos) | ARPU / Churn |
| CAC | < R$ 150 | Marketing + vendas / novos pagantes |
| Conversão grátis→pago | > 5% | Novos pagos / total terreiros |
| Take Rate Marketplace | 12-15% | Comissão / GMV |
