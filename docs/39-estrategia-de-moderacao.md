# 39 — Estratégia de Moderação

## Arquitetura da Moderação

A moderação do AxéMap opera em **3 camadas**:

```
Camada 1: IA (Automática) → 80% do volume
Camada 2: Comunidade (Reports) → 15% do volume
Camada 3: Humana (Especialistas) → 5% do volume
```

## Camada 1: Moderação por IA

### O que a IA modera automaticamente

| Tipo de Conteúdo | Decisão Automática | Confiança Mínima |
|-----------------|-------------------|-----------------|
| **Discurso de ódio** (raça, religião, gênero) | Rejeitar + ban do autor | 95% |
| **Conteúdo NSFW** em fotos de terreiro | Rejeitar + sinalizar | 90% |
| **Spam** (links suspeitos, texto repetitivo) | Rejeitar | 85% |
| **Avaliação sem mínimo de caracteres** | Rejeitar | 100% |
| **Avaliação duplicada** (mesmo texto em terreiros diferentes) | Sinalizar para revisão | 80% |
| **Terreiro com nome ofensivo** | Rejeitar cadastro | 90% |
| **Foto de perfil genérica** (banco de imagens) | Sinalizar para revisão | 70% |

### Tecnologia de IA para Moderação

| Funcionalidade | Ferramenta | Modelo |
|---------------|-----------|--------|
| Detecção de hate speech | Hugging Face / OpenAI Moderation | Modelo fine-tuned em português |
| Detecção de NSFW | Cloudflare NSFW / Amazon Rekognition | Modelo pré-treinado |
| Detecção de spam | Regras + ML (Naive Bayes) | Modelo treinado com dados da plataforma |
| Similaridade de texto | Simhash + embeddings | — |
| Reverse image search | Google Vision API / TinEye | API externa |

## Camada 2: Moderação pela Comunidade

### Sistema de Reports

| Elemento | Descrição |
|----------|-----------|
| **Botão "Reportar"** | Disponível em: avaliações, comentários, posts, terreiros, mensagens |
| **Categorias de report** | Discurso de ódio, informação falsa, spam, conteúdo impróprio, outro |
| **Anonimato** | Report é anônimo (o reportado não sabe quem reportou) |
| **Limite de reports** | 5 reports/hora por usuário (anti-abuso) |

### Curadores da Comunidade (Futuro)

Usuários com alta reputação (Veteranos) podem se tornar curadores voluntários:
- Acesso a fila de moderação
- Decisão: aprovar, rejeitar ou escalar para humana
- Limite: 50 decisões/dia
- Revisão: 10% das decisões são auditadas

## Camada 3: Moderação Humana

### Equipe de Moderação

| Fase | Modo | Qtde | Perfil |
|------|------|------|--------|
| MVP (mês 0-6) | Fundadores | 1-2 pessoas | Admin do sistema |
| Crescimento (mês 6-12) | Freelancer part-time | 1 pessoa | Conhecedor das religiões |
| Escala (mês 12+) | Time dedicado | 3-5 pessoas | Moderadores treinados |

### Tempos de Resposta

| Tipo de Conteúdo | SLA Máximo |
|-----------------|-----------|
| **Avaliação pendente** | 4h |
| **Cadastro de terreiro** | 24h |
| **Report de hate speech** | 30 min (prioridade máxima) |
| **Report de spam** | 2h |
| **Report de informação falsa** | 24h |
| **Recurso de moderação** | 48h |

### Diretrizes para Moderadores Humanos

| Princípio | Aplicação |
|-----------|-----------|
| **Dúvida beneficia o conteúdo** | Se não tem certeza, aprove (mas sinalize para revisão) |
| **Contexto importa** | Uma crítica doutrinária não é hate speech |
| **Consistência** | Decisões similares para casos similares (documentar precedentes) |
| **Neutralidade** | Moderador não pode ter conflito com o terreiro avaliado |
| **Saúde mental** | Moderadores têm suporte psicológico (conteúdo pesado) |

## Ciclo de Moderação de Avaliação

```
Avaliação submetida
    │
    ▼
[IA] Análise automática
    │
    ├── Aprovada (confiança > 95%) → Publicada imediatamente
    │
    ├── Rejeitada (confiança > 95%) → Bloqueada + notificação ao autor
    │
    └── Inconclusiva (confiança < 95%) → Fila de moderação humana
        │
        ▼
    [Humano] Revisão manual
        │
        ├── Aprovada → Publicada
        └── Rejeitada → Bloqueada + notificação + motivo
```

## Recursos e Apelações

| Direito | Descrição |
|---------|-----------|
| **Notificação** | Autor é notificado com motivo da rejeição |
| **Recurso** | Pode recorrer em até 7 dias com justificativa |
| **Revisão por par** | Recurso é revisado por moderador diferente |
| **Tempo de resposta** | Recurso respondido em até 48h |
| **Decisão final** | Decisão do recurso é final (salvo novo contexto) |

## Métricas de Moderação

| Métrica | Meta |
|---------|------|
| Conteúdo moderado por IA | 80%+ do volume total |
| Precisão da IA | > 95% |
| Tempo médio de moderação (IA) | < 1s |
| Tempo médio de moderação (humana) | < 4h |
| Taxa de acerto humano (auditoria) | > 98% |
| Recursos recebidos | < 5% das decisões |
| Recursos bem-sucedidos | > 30% (sinal de que moderação não é arbitrária) |
| Conteúdo removido incorretamente (falso positivo) | < 1% |
