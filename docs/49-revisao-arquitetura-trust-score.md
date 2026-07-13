# 49 — Revisão da Arquitetura para Trust Score

## Impacto do Trust Score na Arquitetura

Após a definição do Trust Score como **diferencial competitivo central**, a arquitetura existente (documento 05) foi revisada. Abaixo, todas as mudanças necessárias.

---

## 1. Mudanças no Banco de Dados

### 1.1 Novas Tabelas (Criadas no documento 41)

| Tabela | Finalidade | Essencial para MVP? |
|--------|-----------|-------------------|
| `trust_score_logs` | Histórico de scores | ✅ Sim (desde o dia 1) |
| `verificacoes` | Selos de verificação | ✅ Sim |
| `metricas_terreiro` | Cache de métricas para score | ✅ Sim |
| `sinalizacoes_trust` | Alertas de score | ⭕ Pós-MVP |
| `reputacao_avaliador` | Peso dos avaliadores | ✅ Sim |
| `sessoes_verificacao` | Audit trail de documentos | ⭕ Pós-MVP |

### 1.2 Campos Adicionados em Tabelas Existentes

| Tabela | Campos Novos | Essencial? |
|--------|-------------|-----------|
| `terreiros` | trust_score, trust_score_nivel, trust_score_updated_at, ultimo_login_at, taxa_resposta, total_eventos_30d, total_acoes_sociais, completa_profile, percentual_completeza | ✅ |
| `avaliacoes` | peso_avaliador, score_contribuicao, total_uteis | ✅ |

### 1.3 Índices Adicionais

```sql
-- Índices para performance do Trust Score
CREATE INDEX idx_terreiros_trust_score ON terreiros(trust_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_terreiros_completeza ON terreiros(percentual_completeza DESC);
CREATE INDEX idx_trust_score_logs_terreiro_data ON trust_score_logs(terreiro_id, created_at DESC);
CREATE INDEX idx_metricas_atualizacao ON metricas_terreiro(dias_desde_ultima_atualizacao);
```

---

## 2. Mudanças na API

### 2.1 Novos Endpoints

| Método | Endpoint | Descrição | Auth | MVP? |
|--------|----------|-----------|------|------|
| GET | /api/v1/terreiros/{slug}/trust-score | Detalhamento completo do Trust Score | ❌ | ✅ |
| GET | /api/v1/terreiros/{slug}/verificacoes | Selos de verificação conquistados | ❌ | ✅ |
| POST | /api/v1/terreiros/{slug}/verificar/solicitar | Solicitar verificação | Token (owner) | ✅ |
| POST | /api/v1/terreiros/{slug}/verificar/enviar-documentos | Enviar docs para Nível 3 | Token (owner) | ✅ |
| GET | /api/v1/admin/verificacoes/pendentes | Lista de verificações pendentes | Admin | ✅ |
| POST | /api/v1/admin/verificacoes/{id}/aprovar | Aprovar verificação | Admin | ✅ |
| POST | /api/v1/admin/verificacoes/{id}/rejeitar | Rejeitar verificação | Admin | ✅ |
| GET | /api/v1/trust-score/ranking | Ranking global de Trust Score | ❌ | ⭕ |
| GET | /api/v1/transparencia/trust-score | Documentação do algoritmo | ❌ | ✅ |

### 2.2 Endpoints Modificados

**Busca** (`/api/v1/busca`):
- **Antes:** ordenação por padrão (relevância + distancia)
- **Agora:** ordenação padrão = Trust Score (decrescente) + distância
- **Novo parâmetro:** `min_trust_score=30` (filtra por score mínimo)
- **Novo campo no response:** `trust_score`, `trust_score_nivel`, `selos`

**Perfil do terreiro** (`/api/v1/terreiros/{slug}`):
- **Novos campos no response:** `trustScore` (completo), `verificacoes`, `nivel`, `ultimaAtualizacao`, `taxaResposta`

**Avaliações** (`/api/v1/avaliacoes`):
- **Novo campo no response:** `pesoAvaliador` (visível apenas para o admin/owner)
- **Ordenação:** avaliações de maior peso aparecem primeiro

### 2.3 Webhooks para Eventos de Trust Score

| Evento Webhook | Descrição | Disparo |
|---------------|-----------|---------|
| `trust_score.changed` | Trust Score mudou de nível | Quando cruza limiar de nível |
| `verification.completed` | Selo de verificação conquistado | Quando verificação é aprovada |
| `verification.revoked` | Selo removido | Quando verificação é revogada |
| `trust_score.penalty` | Penalidade aplicada | Quando denúncia é confirmada |

---

## 3. Mudanças nos Casos de Uso

### 3.1 Novos Casos de Uso

| ID | Caso de Uso | Ator | MVP? |
|----|------------|------|------|
| UC19 | Visualizar Trust Score Detalhado | Visitante/Praticante | ✅ |
| UC20 | Solicitar Verificação de Perfil | Pai/Mãe de Santo | ✅ |
| UC21 | Enviar Documentos para Verificação | Pai/Mãe de Santo | ✅ |
| UC22 | Aprovar/Rejeitar Verificação | Admin | ✅ |
| UC23 | Visualizar Dicas para Melhorar Trust Score | Pai/Mãe de Santo | ✅ |
| UC24 | Reportar Avaliação Abusiva | Praticante | ✅ |
| UC25 | Recorrer de Decisão de Moderação | Qualquer usuário | ✅ |
| UC26 | Visualizar Transparência do Algoritmo | Visitante | ✅ |

### 3.2 Casos de Uso Modificados

**UC01 (Buscar Terreiros):**
- Adicionar ordenação por Trust Score
- Adicionar filtro por score mínimo
- Exibir nível de confiança nos cards

**UC02 (Visualizar Perfil):**
- Adicionar seção "Trust Score" com gráfico radar
- Adicionar selos de verificação
- Adicionar "Como melhorar este score" (se for owner)

**UC04 (Avaliar Terreiro):**
- Avaliador precisa ter conta com > 7 dias para peso > 0.5x
- Avaliador iniciante (< 7 dias) tem peso 0.1x (quase não impacta o score)

---

## 4. Mudanças nos Fluxos

### 4.1 Fluxo 8: Cálculo do Trust Score

```
[Evento dispara recalculo] (ex: perfil atualizado, nova avaliação)
  → [BullMQ] trust-score-queue
    → RecalcularTrustScoreHandler
      → 1. Calcula Completeza (campos preenchidos / total campos)
      → 2. Calcula Verificação (selos conquistados / selos possíveis)
      → 3. Calcula Atualização (dias desde último evento, login, atualização)
      → 4. Calcula Reputação (média ponderada das avaliações)
      → 5. Calcula Histórico (dias na plataforma, denúncias)
      → 6. Calcula Engajamento Social (ações sociais, taxa resposta)
      → 7. Calcula Score Final = (C×0.25 + V×0.25 + A×0.15 + R×0.20 + H×0.10 + S×0.05)
      → 8. Determina Nível (Novo/Estabelecido/Confiável/Referência/Excelência)
      → 9. Salva em trust_score_logs
      → 10. Atualiza terreiros.trust_score
      → 11. Se mudou de nível → dispara NivelConfiancaAlterado
```

### 4.2 Fluxo 9: Verificação de Perfil

```
[Dirigente] → [Painel] → "Solicitar Verificação"
  → Escolhe nível de verificação:
    ├── Nível 1 (Contato) — automático
    │   → Código via WhatsApp → confirma → selo concedido
    │
    ├── Nível 2 (Informações) — automático
    │   → Sistema verifica completeza → selo concedido
    │
    └── Nível 3 (Identidade) — manual
        → Upload de documentos (front/back RG + selfie)
        → [Criptografados] → [S3 privado]
        → [BullMQ] verification-queue
        → Admin revisa
          ├── Aprova → Selo "Identidade Confirmada"
          └── Rejeita → Notificação com motivo + instruções
```

### 4.3 Fluxo 10: Avaliação com Peso do Avaliador

```
[Usuário escreve avaliação]
  → [AvaliacaoCriada] event
    → Verifica reputação do avaliador:
      ├── < 7 dias de conta → peso 0.5x
      ├── 7-30 dias → peso 1.0x
      ├── 30+ dias + 5+ avaliações aprovadas → peso 1.5x
      └── 6+ meses + 30+ avaliações → peso 2.0x
    → Salva peso_avaliador na avaliação
    → Quando aprovada, recalcula Trust Score
    → score_contribuicao = nota × peso_avaliador
```

---

## 5. Mudanças na Estrutura de Pastas

### 5.1 Novos Módulos no Backend

```
packages/api/src/modules/
  ├── trust-score/                    # NOVO
  │   ├── trust-score.module.ts
  │   ├── trust-score.controller.ts
  │   ├── trust-score.service.ts
  │   ├── calculators/
  │   │   ├── completeza.calculator.ts
  │   │   ├── verificacao.calculator.ts
  │   │   ├── atualizacao.calculator.ts
  │   │   ├── reputacao.calculator.ts
  │   │   ├── historico.calculator.ts
  │   │   └── social.calculator.ts
  │   ├── events/
  │   │   └── trust-score.handler.ts
  │   └── dto/
  │       └── trust-score.dto.ts
  │
  ├── verificacao/                    # NOVO
  │   ├── verificacao.module.ts
  │   ├── verificacao.controller.ts
  │   ├── verificacao.service.ts
  │   └── dto/
  │
  ├── reputacao-avaliador/            # NOVO
  │   ├── reputacao-avaliador.module.ts
  │   ├── reputacao-avaliador.service.ts
  │   └── dto/
  │
  ├── sinalizacoes/                   # NOVO
  │   ├── sinalizacoes.module.ts
  │   └── sinalizacoes.service.ts
  │
  └── transparencia/                  # NOVO
      ├── transparencia.module.ts
      └── transparencia.controller.ts
```

### 5.2 Novos Componentes no Frontend

```
apps/web/src/components/
  ├── trust-score/                    # NOVO
  │   ├── TrustScoreBadge.tsx         # Selo com nível (🌱 🌿 🌳 🏆 👑)
  │   ├── TrustScoreDetail.tsx        # Modal com detalhamento completo
  │   ├── TrustScoreRadar.tsx         # Gráfico radar dos componentes
  │   ├── TrustScoreProgress.tsx      # Barra de progresso para próximo nível
  │   └── TrustScoreTips.tsx          # Dicas de melhoria
  │
  ├── verificacao/                    # NOVO
  │   ├── VerificationBadge.tsx       # Selo individual (🛡️, ⭐, 📱)
  │   ├── VerificationList.tsx        # Lista de selos conquistados
  │   └── VerificationForm.tsx        # Formulário de envio de documentos
  │
  ├── avaliacao/                      # MODIFICADO
  │   ├── RatingStars.tsx             # (já existia)
  │   ├── ReviewCard.tsx              # Mostra peso do avaliador (admin)
  │   └── ReviewWeight.tsx            # Indicador de peso "Avaliação verificada"
```

---

## 6. Mudanças nas Filas (BullMQ)

### 6.1 Novas Filas

| Fila | Eventos | Prioridade | Descrição |
|------|---------|-----------|-----------|
| **trust-score-queue** | PerfilAtualizado, AvaliacaoModerada, VerificacaoConcluida, DenunciaConfirmada, LoginRealizado | Alta | Recalcular Trust Score |
| **verification-queue** | SolicitacaoVerificacao | Alta | Processar documentos de verificação |
| **reputacao-queue** | AvaliacaoModerada, AvaliacaoMarcadaUtil | Média | Atualizar reputação do avaliador |

---

## 7. Novos Domain Events

(Detalhados no documento 42 — resumo aqui)

| Evento | Handler | Ação |
|--------|---------|------|
| **TrustScoreRecalculado** | VerificarMudancaNivelHandler | Dispara NivelConfiancaAlterado se mudou |
| **NivelConfiancaAlterado** | NotificarDirigenteHandler | Notifica dirigente sobre mudança |
| **VerificacaoConcluida** | TrustScoreVerificacaoHandler | Recalcula componente de verificação |
| **VerificacaoRevogada** | TrustScorePenalidadeHandler | Aplica penalidade |
| **DenunciaConfirmada** | TrustScorePenalidadeHandler | Reduz score e registra sinalização |

---

## 8. Mudanças na Ordenação da Busca

**Algoritmo de ordenação revisado:**

```
Ordenação Padrão (BUSCA):
  score_ponderado = (trust_score × 0.7) + (1 - distancia_normalizada × 0.3)
  
  Onde:
    - trust_score: 0-100 (70% do peso)
    - distancia_normalizada: distância máxima assumida 100km (30% do peso)

Ordenação por Relevância:
  score_ponderado = (trust_score × 0.5) + (relevancia_texto × 0.3) + (1 - distancia_normalizada × 0.2)
```

---

## 9. Checklist de Verificação para MVP

### Tudo que PRECISA estar pronto no MVP

| Item | Documento | Status |
|------|-----------|--------|
| Trust Score calculado em tempo real | 28, 41 | 🔲 Implementar |
| Selos de verificação (Nível 1 e 2 automáticos) | 28, 36 | 🔲 Implementar |
| Nível 3 (identidade) com upload de documentos | 36 | 🔲 Implementar |
| Peso do avaliador no cálculo da reputação | 29, 41 | 🔲 Implementar |
| Detalhamento do Trust Score no perfil | 28, 49 | 🔲 Implementar |
| Score visível nos cards de busca | 28, 49 | 🔲 Implementar |
| Ordenação da busca por Trust Score | 49 | 🔲 Implementar |
| Filtro por score mínimo | 49 | 🔲 Implementar |
| Notificação de mudança de nível | 42, 49 | 🔲 Implementar |
| Painel admin de verificação | 36, 49 | 🔲 Implementar |
| Página de transparência do algoritmo | 28, 48 | 🔲 Implementar |
| Moderação de avaliações (IA + humana) | 37, 39 | 🔲 Implementar |
| Sistema anti-fraude básico (rate limit, captcha) | 38 | 🔲 Implementar |

### O que fica para PÓS-MVP

| Item | Documento | Previsto |
|------|-----------|----------|
| Gamificação completa (pontos, badges, leaderboards) | 40 | Sprint 20+ |
| Moderação IA avançada (fine-tuned) | 39 | Sprint 28+ |
| Curadores da comunidade (voluntários) | 39 | Sprint 32+ |
| Ranking público de Trust Score | 49 | Sprint 24+ |
| Verificação automática de fotos (pHash) | 36 | Sprint 18+ |
| Reverse image search para fotos | 36 | Sprint 24+ |
| Conselho consultivo de governança | 48 | Mês 6+ |

---

## 10. Resumo de Decisões Alteradas

| Decisão Original | Decisão Revisada | Motivo |
|-----------------|-----------------|--------|
| Ordenação por relevância + distância | Ordenação por Trust Score + distância | Confiança > proximidade |
| Avaliação com peso uniforme | Avaliação com peso do avaliador | Anti-fraude e qualidade |
| Completeza como métrica interna | Completeza como componente do Trust Score (25%) | Incentivar perfis completos |
| Sem rank público | Trust Score público e detalhável | Transparência |
| Moderação 100% manual no início | IA modera 80% automaticamente no MVP | Escalabilidade inicial |
| Sem gamificação no MVP | Gamificação básica (níveis) no MVP | Retenção precoce |
| Busca sem filtro de confiança | Busca com filtro de score mínimo | Usuário pode escolher confiança |
| Score de terreiro é "estático" | Score recalcula em tempo real via eventos | Dinâmico e responsivo |

---

## Conclusão

A arquitetura existente **precisa de adaptações**, mas a base (Clean Architecture + DDD + Event-Driven) já contempla bem o Trust Score. As principais mudanças são:

1. **Banco:** 6 novas tabelas + campos adicionais
2. **API:** 7 novos endpoints + modificação em 3 endpoints existentes
3. **Casos de Uso:** 8 novos + 3 modificados
4. **Fluxos:** 3 novos fluxos de domínio + modificação em busca e avaliação
5. **Módulos Backend:** 5 novos módulos + handlers de eventos
6. **Componentes Frontend:** 2 novos diretórios de componentes + modificação em avaliação

Nada disso quebra a arquitetura existente — são **adições** que se integram via eventos de domínio. A decisão de usar Event-Driven desde o início se prova acertada: o Trust Score é um consumidor de eventos que já estavam planejados.

**Autorização para iniciar o código:** ✅ Concedida, sujeita ao checklist acima.
