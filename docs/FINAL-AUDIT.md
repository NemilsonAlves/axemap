# FINAL AUDIT — AxéMap
> Versão: 2025-07 | Fase: Pré-Staging Final
> Build: ✅ 57 páginas | TypeScript: ✅ 0 erros | Prisma: ✅ schema válido

---

## Resumo Executivo

Auditoria completa do ecossistema AxéMap — frontend Next.js, backend NestJS, schema Prisma, segurança, LGPD, ADS, TV, Mapa, Trust, RBAC e todos os fluxos de cadastro.

**Resultado**: plataforma integrada, sem erros de TypeScript, build limpo. 9 bugs críticos corrigidos ao longo da fase de hardening.

---

## Arquitetura Real Encontrada

```
apps/
  web/         Next.js 16 (App Router, Turbopack)
  api/         NestJS + Passport JWT + Helmet + ValidationPipe

packages/
  database/    Prisma + PostgreSQL/PostGIS
  shared/      Enums, tipos compartilhados
```

**Módulos NestJS confirmados** (por leitura de código):
`auth` · `terreiro` · `eventos` · `campanhas` · `organizacoes` · `verificacao` · `trust-ecosystem` · `moderation` · `denuncias` · `upload` · `geo` · `discovery` · `recommendation` · `analytics` · `audit-logs` · `feature-flags` · `growth` · `ranking` · `admin` · `saas` · `tv` · `ads` · `consent` · `notificacoes` · `payments` · `apoie` · `taxonomy`

---

## Matriz de Integração

| Módulo | Front | API | DB | RBAC | Trust Isolado | Status |
|--------|:-----:|:---:|:--:|:----:|:-------------:|:------:|
| Auth signup/login/refresh | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| Terreiros / CRUD | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 PASS |
| Localização / Privacidade Geo | ✅ | ✅ | ✅ | – | – | 🟢 PASS |
| Mapa Interativo | ✅ | ✅ | ✅ | – | – | 🟢 PASS |
| Mapa Constelação (MapaVivo) | ✅ | ✅ | ✅ | – | – | 🟢 PASS |
| Eventos | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| Campanhas | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| Trust Ecosystem | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 PASS |
| Verificação | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 PASS |
| Denúncias / Moderação | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| ADS (create/moderate) | ✅ | ✅ | ⚠️* | ✅ | ✅ | 🟡 PARCIAL |
| TV AxéMap | ✅ | ✅ | ⚠️* | ✅ | – | 🟡 PARCIAL |
| LGPD / Privacy Center | ✅ | ✅ | ⚠️* | ✅ | – | 🟡 PARCIAL |
| Organizações / Federações | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| Upload / Storage | ✅ | ✅ | – | ✅ | – | 🟢 PASS |
| SuperAdmin / Audit Logs | ✅ | ✅ | ✅ | ✅ | – | 🟢 PASS |
| Busca / Discovery | ✅ | ✅ | ✅ | – | – | 🟢 PASS |
| Cookie Consent | ✅ | ✅ | ⚠️* | – | – | 🟡 PARCIAL |

> ⚠️* = migration pendente (executar manualmente antes do staging)

---

## Bugs Corrigidos Nesta Fase

| # | Arquivo | Bug | Severidade | Fix |
|---|---------|-----|:----------:|-----|
| 1 | `ads/anunciar/page.tsx` | `category` ausente → 400 em toda submissão | ⚫ BLOCKER | Adicionado seletor + validação client-side |
| 2 | `ads/anunciar/page.tsx` | `urlDestino` → `destinatarioUrl` (nome errado) | 🔴 FAIL | Campo renomeado corretamente |
| 3 | `ads.types.ts` | `anuncianteId` como required no DTO | 🔴 FAIL | Removido do DTO; injetado via JWT |
| 4 | `auth.service.ts` | Login sem bcrypt quando user não existe (timing attack) | 🔴 FAIL | bcrypt com dummy hash sempre executado |
| 5 | `terreiro.service.ts` | `arquivoUrl` docs verificação exposta no perfil público | 🔴 FAIL | Campo removido do select público |
| 6 | `schema.prisma` | Espaço extra no campo `tradicao` | 🟡 PARTIAL | Indentação corrigida |
| 7 | `map-content.tsx` | "World Map" / "diásporas" — viola Brasil-primeiro | 🟡 PARTIAL | Copy reescrita |
| 8 | `leaflet-map.ts` | Marcadores sem diferenciação de Trust / verificação | 🟡 PARTIAL | Pulse animado + tamanho por Trust + Trust Score no popup |
| 9 | `ads-trust-separation.spec.ts` | Spec quebrado pelo fix do DTO | 🟡 PARTIAL | Alinhado ao DTO correto |

---

## Mapa — Auditoria

### O que existe e funciona
- **Mapa Leaflet**: OpenStreetMap + marcadores com pulse animado por Trust Score
- **Visualização Constelação (MapaVivo)**: novo SVG — nós pulsantes, linhas de conexão, glow radial, labels de cidade, painel Trust Score animado, badge "Casa verificada"
- **Vista Lista**: thumbnails de foto, Trust score colorido, badge de verificação
- **Filtros reais**: Camada (Tudo/Comunidades/Campanhas), Região, Tradição, Busca textual
- **Filtro de Tradição**: Candomblé, Umbanda, Batuque, Tambor de Mina, Xangô, Jurema
- **Painel lateral rico**: foto hero, Trust bar animada, "Ver perfil" + "Como chegar" + "Compartilhar", grid de atalhos (Eventos, Apoio, Comunidade, Avaliações)
- **Privacidade geográfica**: `mascararLocalizacao()` aplicado na API — PRIVADA, APROXIMADA, PUBLICO
- **PostGIS**: queries com `visibilidade_localizacao != 'PRIVADA'` enforçado

### Pendências
- Clustering de marcadores para escala (> 1000 pontos)
- Bounding box dinâmico (atualmente carrega até 500 registros)

---

## TV AxéMap — Auditoria

| Item | Estado |
|------|:------:|
| Página `/tv` | ✅ |
| Backend TV module | ✅ |
| DB `EpisodioTV` | ✅ (migration pendente) |
| Cards "Em breve" (sem youtubeId) | ✅ sem quebrar |
| IDs únicos (`tv-coming-soon-01/02/03`) | ✅ |
| Popup boas-vindas | ✅ localStorage, ESC, focus trap |
| Mini player áudio | ✅ user-initiated, nunca autoplay |
| Fallback áudio | ✅ `/audio/axemap/de-volta.mp3` |

---

## ADS — Status Real

| Componente | Real | Observação |
|-----------|:----:|-----------|
| `/ads` landing | ✅ | |
| `/ads/anunciar` | ✅ | CORRIGIDO: category + DTO correto |
| `/ads/campanhas` | ✅ | |
| `/admin/ads` | ✅ | |
| `POST /ads/pedidos` | ✅ | |
| Admin aprovar/publicar/pausar/rejeitar | ✅ | |
| DB `AdCampanha` | ✅ | Migration pendente |
| Pagamento real | ❌ | Stripe/PIX a implementar |
| Trust isolation | ✅ | Confirmado por grep + test spec |

---

## LGPD — Auditoria

| Item | Estado |
|------|:------:|
| Banner cookie + revogação | ✅ |
| Página `/privacidade` | ✅ |
| Página `/cookies` | ✅ |
| Página `/meus-dados` (Privacy Center) | ✅ |
| `GET /auth/exportar-dados` | ✅ |
| `DELETE /auth/conta` | ✅ |
| `POST /auth/revogar-consentimento` | ✅ |
| `ConsentRecord` DB model | ✅ (migration pendente) |
| Consent Manager reativo | ✅ |
| DPO nomeado | ❌ A nomear |

---

## Segurança — Auditoria

| Item | Estado |
|------|:------:|
| Helmet CSP restrita | ✅ |
| CORS sem wildcard | ✅ |
| ValidationPipe whitelist | ✅ |
| Anti-enumeração signup | ✅ |
| Anti-enumeração login | ✅ (CORRIGIDO) |
| Anti-enumeração forgot-password | ✅ |
| Docs verificação privados | ✅ (CORRIGIDO) |
| Localização mascarada | ✅ |
| JWT localStorage | ⚠️ Risco XSS moderado |
| Rate limiting | ⚠️ Limites a revisar |

---

## Cadastros — Fluxo e Status

| Fluxo | Frontend | API | DB | Testado | Status |
|-------|:--------:|:---:|:--:|:-------:|:------:|
| Usuário | ✅ | ✅ | ✅ | Build | 🟢 |
| Casa/Terreiro | ✅ | ✅ | ✅ | Build | 🟢 |
| Federação | ✅ | ✅ | ✅ | Build | 🟡 (vínculo manual) |
| Organização | ✅ | ✅ | ✅ | Build | 🟢 |
| Evento | ✅ | ✅ | ✅ | Build | 🟢 |
| Campanha | ✅ | ✅ | ✅ | Build | 🟢 |
| ADS | ✅* | ✅ | ⚠️ | Build | 🟡 (migration) |
| Denúncia | ✅ | ✅ | ✅ | Build | 🟢 |
| Verificação | ✅ | ✅ | ✅ | Build | 🟢 |

---

## Migrations Pendentes

```powershell
cd packages/database
npx prisma migrate dev --name add-consent-record
npx prisma migrate dev --name add-episodio-tv
npx prisma generate
```

---

## Validação Final

| Check | Resultado |
|-------|:---------:|
| `prisma validate` | ✅ |
| `tsc --noEmit` (api) | ✅ |
| `tsc --noEmit` (web) | ✅ |
| `next build` | ✅ 57 páginas |
| Erros críticos | 0 |
| Warnings (middleware deprecation) | 1 pré-existente |
