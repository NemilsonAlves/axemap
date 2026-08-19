# ADS-STATUS.md — AxéMap ADS

> Auditoria do módulo de publicidade — Julho 2026

---

## Status do Módulo ADS

**ADS É UM MÓDULO REAL (backend + frontend + banco de dados).**

Evidências:
- `apps/api/src/ads/` — módulo completo com controller, service, types, admin controller
- `packages/database/prisma/schema.prisma` — modelos `AdCampanha` e `AdPagamento` definidos
- `apps/api/src/app.module.ts` — `AdsModule` importado no AppModule
- Endpoints reais: `GET /api/v1/ads/publicados`, `POST /api/v1/ads/pedidos`, etc.

---

## REGRA ABSOLUTA — Evidência de Conformidade

**PAGAMENTO PUBLICITÁRIO NUNCA ALTERA:**
- Trust Score
- Verificação
- Certificação
- Posição orgânica no mapa
- Avaliações
- Denúncias

### Evidências por arquivo

| Arquivo | Evidência |
|---------|-----------|
| `ads.service.ts` | Buscas por `trustScore`, `verificado`, `statusVerificacao`, `confianca`, `score` retornaram **ZERO** resultados. Os métodos `aprovar()`, `publicar()`, `pausar()`, `rejeitar()`, `bloquear()` alteram **APENAS** o modelo `AdCampanha`. |
| `ads.types.ts` | Comentário explícito na linha 1: "Pagamento publicitário NUNCA altera Trust Score..." |
| `ads-admin.controller.ts` | Comentário explícito: "REGRA: aprovar/publicar um anúncio NUNCA altera Trust Score..." |
| `ads.service.ts:publicar()` | Comentário: "REGRA ABSOLUTA: publicar anúncio não altera Trust Score nem verificação" |
| `ads.service.ts:listarPublicados()` | Sempre inclui `rotulo: 'PATROCINADO'` em todos os anúncios retornados |

---

## Campos do AdCampanha (schema)

O modelo `AdCampanha` contém exclusivamente campos de publicidade:
- `titulo`, `descricao`, `destinatarioUrl`, `imagemUrl`
- `placement` (onde aparece o anúncio)
- `category` (tipo de anúncio)
- `cidadeAlvo`, `estadoAlvo` (segmentação geográfica)
- `orcamentoBRL`, `dataInicio`, `dataFim`
- `status`, `impressoes`, `cliques`
- `anuncianteId` → relação com `Usuarios`
- `revisadoPorId` → relação com `Usuarios` (admin)

**NENHUM campo toca em:** `trustScore`, `isVerified`, `verificationLevel`, `statusVerificacao`, `avaliacao`, `ranking`

---

## Teste de Isolamento

Arquivo: `apps/api/src/ads/ads-trust-isolation.spec.ts`

Cenários cobertos:
1. `aprovar()` → não toca `terreiros.update` nem `usuarios.update`
2. `publicar()` → não inclui campos de trust/verificação na atualização
3. `listarPublicados()` → sempre inclui `rotulo: 'PATROCINADO'`, nunca inclui `trustScore`/`isVerified`
4. `rejeitar()` → não penaliza trust score do anunciante

**Status dos testes:** NÃO TESTADO em CI (ambiente de CI/CD ainda não configurado).

---

## Fluxo Completo do ADS

```
Anunciante                  Sistema ADS                 Moderação Admin
    │                           │                             │
    ├── POST /ads/pedidos ──────►│                             │
    │                    AdCampanha.status = AGUARDANDO_PAGAMENTO
    │                           │                             │
    ├── (pagamento simulado) ───►│                             │
    │                    AdCampanha.status = EM_REVISAO        │
    │                           │────────────────────────────►│
    │                           │            POST /admin/ads/:id/aprovar
    │                           │◄────────────────────────────│
    │                    AdCampanha.status = APROVADO          │
    │                           │────────────────────────────►│
    │                           │            POST /admin/ads/:id/publicar
    │                           │◄────────────────────────────│
    │                    AdCampanha.status = PUBLICADO         │
    │                           │                             │
    │◄── GET /ads/publicados ───│ (sempre rotulo: 'PATROCINADO')
```

---

## Risco Residual

- **Baixo:** Sem integração com Trust Score ou verificação — risco de contaminação é **ZERO** por design do código
- **Monitoramento:** Qualquer modificação futura ao `ads.service.ts` deve ser revisada por PR com checklist de isolamento
