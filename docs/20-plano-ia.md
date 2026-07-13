# 20 — Plano IA

## Visão Geral

A IA do AxéMap será um conjunto de ferramentas inteligentes para **melhorar descoberta, moderação e experiência do usuário**, sem substituir o julgamento humano em questões espirituais.

## Módulos de IA

### 1. Busca Inteligente Semântica
**Tecnologia:** Embeddings (OpenAI/text-embedding-3-small ou similar open-source) + pgvector

**Como funciona:**
- Texto do perfil do terreiro (descrição, características) convertido em embedding (1536 dimensões)
- Busca do usuário convertida em embedding
- Similaridade de cosseno no PostgreSQL (pgvector)
- Combinação com busca textual tradicional (full-text search)

**Resultado:** O usuário busca "terreiro acolhedor para LGBTQIA+ em Recife" e encontra resultados relevantes mesmo que o terreiro não tenha essas palavras exatas.

### 2. Recomendação Personalizada
**Tecnologia:** Collaborative filtering + content-based filtering

**Inputs:**
- Histórico de buscas do usuário
- Avaliações feitas
- Favoritos
- Localização
- Dados demográficos

**Output:** Sugestões na homepage ("Terreiros recomendados para você"), similar ao Netflix/Spotify.

### 3. Assistente Virtual (Chatbot)
**Tecnologia:** LLM (GPT-4o-mini ou Claude Haiku) + RAG com base de conhecimento

**Funcionalidades:**
- "O que é Umbanda?"
- "Qual a diferença entre Candomblé e Umbanda?"
- "Como encontrar um terreiro perto de mim?"
- "O que levar para visitar um terreiro?"
- "O que significa ser filho de santo?"
- "Quais os Orixás mais cultuados?"

**Estrutura:**
- Base de conhecimento (FAQ + artigos + descrições dos terreiros)
- Contexto limitado para evitar alucinações
- Disclaimer: "Sou um assistente do AxéMap. Para questões espirituais aprofundadas, consulte um dirigente de terreiro."

### 4. Moderação Inteligente de Conteúdo
**Tecnologia:** Classificação de texto + detecção de hate speech

**Avaliações:**
- Detecção automática de discurso de ódio, intolerância religiosa, spam
- Análise de sentimento
- Priorização para revisão humana

**Posts da comunidade:**
- Filtro automático de conteúdo impróprio
- Sugestão de remoção para moderadores humanos

### 5. Calendário Religioso Inteligente
**Tecnologia:** Regras baseadas em tradição + ML para datas móveis

**Funcionalidades:**
- Calendário personalizado baseado na tradição do terreiro
- Datas fixas (Festa de Iemanjá, 02/02)
- Datas móveis (Páscoa, para tradições sincréticas)
- Fases da lua (importante para rituais)
- Dia do Orixá regente

### 6. Match Terreiro-Usuário
**Tecnologia:** Questionário + algoritmo de matching

**Fluxo:**
1. Usuário responde 5-8 perguntas curtas:
   - "Qual tradição você tem mais afinidade?"
   - "Você já frequentou terreiro antes?"
   - "Busca desenvolvimento mediúnico?"
   - "Prefere um terreiro mais tradicional ou mais aberto?"
   - "Tem alguma necessidade de acessibilidade?"
2. Algoritmo combina respostas com perfil dos terreiros
3. Retorna top 3 "matches" com explicação do porquê

**Inspiração:** ChurchFinder.com (Match Quiz) + Tinder (cards com match %)

## Stack de IA

| Componente | Tecnologia | Custo |
|------------|-----------|-------|
| Embeddings | text-embedding-3-small | ~$0.13/1M tokens |
| LLM | GPT-4o-mini / Claude Haiku | ~$0.15-0.30/1M tokens |
| Vector DB | pgvector (PostgreSQL) | Grátis (incluso no DB) |
| Classificação | Hugging Face (modelo fine-tuned) | Grátis (self-host) |
| Recomendação | TensorFlow / PyTorch | Custo de treinamento |

## Considerações Éticas

1. **Transparência:** Toda interação com IA é identificada como IA
2. **Não substitui líderes:** A IA não responde questões doutrinárias ou espirituais profundas
3. **Dados sensíveis:** Religião é dado sensível pela LGPD — a IA nunca expõe dados individuais
4. **Viés algorítmico:** Monitoramento constante para evitar favorecimento de tradições
5. **Opt-out:** Usuários podem desativar recomendações personalizadas

## Roadmap IA

| Fase | Período | Entrega |
|------|---------|---------|
| Fase 1 | Mês 5 | Busca semântica integrada |
| Fase 2 | Mês 7 | Assistente virtual (FAQ básico) |
| Fase 3 | Mês 8 | Moderação inteligente (avaliações) |
| Fase 4 | Mês 9 | Recomendação personalizada |
| Fase 5 | Mês 10 | Match Terreiro-Usuário |
| Fase 6 | Mês 11 | Calendário inteligente |
| Fase 7 | Mês 12 | Moderação de comunidade + posts |
