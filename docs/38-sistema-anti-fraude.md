# 38 — Sistema Anti-Fraude

## Perímetro de Defesa

O sistema anti-fraude protege contra:

| Tipo de Fraude | Alvo | Risco |
|---------------|------|-------|
| Avaliações falsas | Reputação | Alto |
| Perfis de terreiro falsos | Confiança | Crítico |
| Contas bots | Comunidade | Alto |
| Engajamento artificial | Gamificação | Médio |
| Fraude no marketplace | Financeiro | Crítico |
| Scraping de dados | Dados | Alto |
| Ataques de spam | Moderação | Médio |
| Criação de contas em massa | Geral | Alto |

## Camadas de Defesa

### Camada 1: Pré-Cadastro (Prevenção)

| Medida | Descrição |
|--------|-----------|
| **Captcha** | Cloudflare Turnstile (invisível, privacy-friendly) |
| **Rate limit por IP** | Máximo 3 cadastros/IP/hora |
| **Email temporário** | Bloqueio de domínios de email temporário (disposable) |
| **Verificação de email** | Link de confirmação obrigatório |
| **Verificação de WhatsApp** | Código SMS para números reais |

### Camada 2: Pós-Cadastro (Detecção)

#### Detecção de Bots
| Indicador | Técnica |
|-----------|---------|
| Velocidade de preenchimento | Tempo < 3s para preencher formulário → bot |
| Mouse tracking | Ausência de movimentos naturais → bot |
| Padrão de IP | Mesmo IP criando múltiplas contas |
| User Agent | User agent headless/bot conhecido |
| Horário de atividade | Atividade 24h sem pausa |

#### Detecção de Avaliações Fraudulentas
| Indicador | Técnica |
|-----------|---------|
| Padrão 5 estrelas | Muitas avaliações 5 estrelas no mesmo terreiro de contas novas |
| Padrão 1 estrela | Ataque coordenado de avaliações negativas |
| Texto genérico | Avaliações com texto idêntico ou similar (simhash) |
| Avaliador único | Usuário que só avalia 1 terreiro (múltiplas vezes) |
| Temporização | Avaliações chegando no mesmo minuto de IPs diferentes |

#### Detecção de Perfis Falsos
| Indicador | Técnica |
|-----------|---------|
| Foto de perfil genérica | Reverse image search (rosto de banco de imagens) |
| Informações inconsistentes | CEP não corresponde à cidade informada |
| Dados copiados | Descrição igual a outro terreiro (plágio) |
| Sem atividade | Conta criada sem nenhuma ação (pode ser perfil falso preparado) |

### Camada 3: Pós-Publicação (Correção)

| Medida | Descrição |
|--------|-----------|
| **Revisão periódica** | Revisão aleatória de 5% dos perfis/mês |
| **Denúncia** | Botão de denúncia em todo conteúdo gerado pelo usuário |
| **Auditoria reversa** | Ao detectar um perfil falso, revisar todas as ações daquele IP |
| **Blacklist compartilhada** | Manter banco de IPs, emails e documentos fraudulentos |

## Regras Automáticas

### Gatilhos de Bloqueio

| Gatilho | Ação Automática |
|---------|----------------|
| 10+ avaliações de contas com < 7 dias no mesmo terreiro em 1h | Bloquear novas avaliações no terreiro por 24h |
| Usuário com 3 avaliações rejeitadas em sequência | Suspensão temporária de 7 dias |
| Mais de 5 contas do mesmo IP | Bloquear novos cadastros daquele IP |
| Descrição do terreiro detectada como plágio | Rejeitar cadastro, notificar admin |
| Tentativa de login com senha incorreta > 5x | Bloquear IP por 15 min |

### Gatilhos de Sinalização (Revisão Humana)

| Gatilho | Ação |
|---------|------|
| Terreiro com Trust Score cresceu 30+ pontos em 24h | Revisão manual |
| Avaliador com 10+ avaliações em 1h | Revisão manual |
| Padrão de avaliações 5 estrelas seguido de 1 estrela no mesmo dia | Revisão manual |
| Novo terreiro com descrição muito similar a outro existente | Revisão manual |

## Medidas para Marketplace

| Medida | Descrição |
|--------|-----------|
| **Verificação de vendedor** | Documento + conta bancária |
| **Escrow** | Pagamento retido até confirmação de entrega |
| **Limite de vendas** | Vendedor novo: máximo 10 vendas/dia |
| **Histórico de devoluções** | Vendedor com > 10% de devoluções → revisão |
| **Fotos de produtos** | Detecção de foto de catálogo (não do produto real) |

## Ferramentas de Análise

| Ferramenta | Uso |
|-----------|-----|
| **Metabase/Superset** | Dashboards de detecção de anomalias |
| **Redis** | Rate limiting, contadores de tentativas |
| **Logs estruturados** | Auditoria de todas as ações suspeitas |
| **Machine Learning** | Modelo de detecção de fraude (futuro) |

## Processo de Investigação

```
Sinalização (automática ou manual)
    │
    ▼
Revisão (humana, prioridade baixa/média/alta)
    │
    ├── Falso positivo → Nada acontece, métrica registrada
    ├── Suspeito leve → Notificação + monitoramento
    └── Confirmado
        │
        ▼
    Ação:
    ├── Remoção de conteúdo
    ├── Suspensão temporária
    ├── Banimento permanente
    └── (se fraude grave) Denúncia às autoridades
```

## Métricas Anti-Fraude

| Métrica | Meta |
|---------|------|
| % de fraudes detectadas antes da publicação | > 95% |
| Taxa de falsos positivos | < 1% |
| Tempo médio de detecção de fraude | < 1h |
| Precisão do modelo de detecção | > 99% |
| Denúncias resolvidas em < 24h | > 90% |
