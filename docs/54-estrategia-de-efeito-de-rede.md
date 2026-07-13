# 54 — Estratégia de Efeito de Rede

## Mapa dos Efeitos de Rede

### Ciclo Principal (Flywheel)

```
                    ┌─────────────────────────┐
                    │                         │
                    │   MAIS TERREIROS        │
                    │   (suprimento)          │
                    │                         │
                    └────────┬────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │                              │
              │   MAIS VISITANTES            │
              │   (demanda)                  │
              │                              │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │                              │
              │   MAIS AVALIAÇÕES            │
              │   (prova social)             │
              │                              │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │                              │
              │   MAIOR CONFIANÇA            │
              │   (Trust Score)              │
              │                              │
              └──────────────┬───────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
   ┌──────────────────────┐   ┌──────────────────────┐
   │                      │   │                      │
   │ NOVOS TERREIROS      │   │ NOVOS USUÁRIOS       │
   │ (querem visibilidade)│   │ (confiam na plataf.) │
   │                      │   │                      │
   └──────────────────────┘   └──────────────────────┘
```

### Ciclos Secundários

#### Ciclo de Eventos
```
Mais terreiros → Mais eventos → Mais visitantes → Mais avaliações → Mais confiança
                  ↑                                                      │
                  └──────────────────────────────────────────────────────┘
```

#### Ciclo do Marketplace
```
Mais terreiros → Mais produtos → Mais compradores → Mais vendedores → Mais receita
                                                      ↑                     │
                                                      └─────────────────────┘
```

#### Ciclo da Comunidade
```
Mais usuários → Mais posts → Mais grupos → Mais engajamento → Mais retenção
                  ↑                                              │
                  └──────────────────────────────────────────────┘
```

#### Ciclo de Verificação
```
Mais terreiros verificados → Maior confiança → Mais visitantes → Mais reivindicações
                                                                         │
                                                                         ▼
                                                            Mais terreiros verificados
```

#### Ciclo de Dados (Enterprise)
```
Mais terreiros → Mais dados → Mais valor para governo/pesquisa → Mais receita enterprise
                  ↑                                                   │
                  └───────────────────────────────────────────────────┘
```

## Os 4 Tipos de Efeito de Rede

| Tipo | Descrição | Exemplo no AxéMap |
|------|-----------|-------------------|
| **Same-side (direto)** | Mais usuários do mesmo lado aumentam o valor | Mais praticantes → mais avaliações, mais conteúdo na comunidade |
| **Cross-side (indireto)** | Mais usuários de um lado aumentam o valor para o outro | Mais terreiros → mais opções para visitantes |
| **Data network** | Mais uso gera mais dados que melhoram o produto | Mais avaliações → Trust Score mais preciso |
| **Social** | Uso visível para amigos incentiva adoção | Compartilhar perfil no WhatsApp → amigos descobrem a plataforma |

## Métricas de Efeito de Rede

| Efeito | Métrica | Fórmula | Meta |
|--------|---------|---------|------|
| Cross-side | Densidade de cobertura | Terreiros / Visitantes por cidade | > 1:100 |
| Cross-side | Taxa de match | Buscas com resultado / Total buscas | > 80% |
| Same-side (avaliador) | Taxa de contribuição | Avaliadores / Visitantes | > 10% |
| Data network | Precisão do Trust Score | Correlação score x satisfação real | > 0.8 |
| Social | Coeficiente viral | Convites que geram cadastro | > 0.3 |

## Estratégia de Ativação dos Ciclos

### Fase 1: Ignição (Terreiros 1-100)
**Objetivo:** Ativar o ciclo principal.
**Ação:** Seed manual de terreiros (qualidade > quantidade).
**Métrica:** Trust Score médio > 30.

### Fase 2: Aceleração (Usuários 1k-10k)
**Objetivo:** Ativar ciclo de avaliações.
**Ação:** Campanha de avaliações (gamificação, incentivos).
**Métrica:** > 100 avaliações/dia.

### Fase 3: Transbordo (Usuários 10k-100k)
**Objetivo:** Ativar ciclos secundários.
**Ação:** Lançar comunidade + marketplace.
**Métrica:** > 10% de usuários ativos na comunidade.

### Fase 4: Dominância (Usuários 100k+)
**Objetivo:** Ativar ciclo de dados enterprise.
**Ação:** API pública + parcerias governamentais.
**Métrica:** Receita enterprise > 20% do total.

## Bloqueadores de Efeito de Rede

| Bloqueador | Mitigação |
|-----------|-----------|
| **Cidade sem terreiros cadastrados** | Seed manual + campanha focada |
| **Trust Score baixo generalizado** | Onboarding melhor + verificação simplificada |
| **Poucas avaliações** | Gamificação + notificações push |
| **Perfis incompletos** | Trust Score como incentivo + dicas contextuais |
| **Marketplace sem liquidez** | Foco em categorias de alta demanda primeiro |
