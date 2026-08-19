# Cookie Audit — AxéMap

> Inventário e conformidade de cookies e armazenamento local
> Versão: 2025-07 | Base legal: LGPD art. 7º + boas práticas GDPR

---

## 1. Arquitetura de Consentimento

O AxéMap implementa um **Cookie Consent Manager** próprio (sem dependências externas) localizado em:

```
apps/web/src/components/cookies/cookie-consent.tsx
```

### Como funciona

1. Na primeira visita, o banner aparece na parte inferior da tela.
2. O usuário pode **Aceitar todos**, **Recusar opcionais** ou **Personalizar** categorias individualmente.
3. A escolha é gravada em `localStorage` com a chave `axemap:cookie-consent` e um campo `version`.
4. Ao atualizar a versão (`CONSENT_VERSION`), todos os usuários são solicitados a reconfirmar.
5. O banner **não** usa `document.cookie` — apenas `localStorage` para a preferência de consentimento.

---

## 2. Inventário de Cookies e Storage

### 2.1 Essenciais (sempre ativos — base legal: necessidade contratual)

| Nome / Chave | Tipo | Origem | Finalidade | TTL |
|--------------|------|--------|------------|-----|
| `axemap-session` | Cookie HTTP-only | API (NestJS) | Sessão autenticada | 30 dias |
| `axemap-refresh` | Cookie HTTP-only | API | Renovação de token | 90 dias |
| `axemap:cookie-consent` | localStorage | Frontend | Preferência de consentimento | Permanente |
| `axemap:theme` | localStorage | Frontend | Tema claro/escuro | Permanente |

### 2.2 Preferências (ativáveis pelo usuário)

| Nome / Chave | Tipo | Origem | Finalidade | TTL |
|--------------|------|--------|------------|-----|
| `axemap:lang` | localStorage | Frontend | Idioma preferido | Permanente |
| `axemap:country` | localStorage | Frontend | País / localização | Permanente |
| `axemap:welcome-popup-seen` | localStorage | Frontend | Popup de boas-vindas (exibir 1x) | Permanente |

### 2.3 Análise (requer consentimento `analytics`)

| Nome / Chave | Tipo | Origem | Finalidade | TTL |
|--------------|------|--------|------------|-----|
| `_plausible` | Cookie 1st-party | Plausible Analytics | Métricas anônimas de visita | Sessão |
| `_ga` | Cookie 3rd-party | Google Analytics (opcional) | Métricas de uso | 2 anos |

> **Nota**: métricas são coletadas somente se `analytics: true` na preferência de consentimento.

### 2.4 Marketing / Publicidade (requer consentimento `marketing`)

| Nome / Chave | Tipo | Origem | Finalidade | TTL |
|--------------|------|--------|------------|-----|
| `axemap:ads-session` | localStorage | Frontend | Rastreamento de cliques em anúncios PATROCINADOS | Sessão |

> **REGRA ABSOLUTA**: cookies de marketing **nunca** afetam Trust Score, verificação ou posição orgânica no mapa.

---

## 3. Componentes do Sistema de Consentimento

```
apps/web/src/components/cookies/
  cookie-consent.tsx      ← Banner + painel de preferências + hook useCookieConsent
```

### API pública do hook

```typescript
import { useCookieConsent } from '@/components/cookies/cookie-consent';

const { prefs, accept } = useCookieConsent();
// prefs?.analytics  → boolean
// prefs?.marketing  → boolean
// prefs?.preferencias → boolean
// accept(ConsentPreferences) → grava e atualiza estado
```

### Versão de consentimento

Quando a política de cookies mudar de forma significativa, incremente `CONSENT_VERSION` em `cookie-consent.tsx`. Todos os usuários sem a versão atual verão o banner novamente.

---

## 4. Integração no Layout

O banner é montado em [`apps/web/src/app/layout.tsx`](../apps/web/src/app/layout.tsx) como último componente antes do `<Toaster>`, garantindo que apareça sobre qualquer outro conteúdo via `z-[var(--z-modal)]`.

---

## 5. Checklist de Conformidade

| Item | Status |
|------|:------:|
| Banner visível na primeira visita | ✅ |
| Opção de recusar cookies opcionais com 1 clique | ✅ |
| Personalização granular por categoria | ✅ |
| Link para política de privacidade no banner | ✅ |
| Consentimento gravado localmente (sem rastreamento) | ✅ |
| Renovação de consentimento por versão | ✅ |
| Cookies essenciais não requerem consentimento | ✅ |
| Cookies de marketing não afetam Trust Score | ✅ |
| Cookies de terceiros bloqueados até consentimento | ⚠️ Pendente (implementação condicional de scripts GA) |
| Logs de consentimento auditáveis no backend | ❌ Pendente |

---

## 6. Ações Pendentes

- [ ] **Carregamento condicional** de scripts de terceiros (GA, Hotjar) apenas após consentimento `analytics`
- [ ] **Endpoint de log de consentimento** (`POST /auth/consentimento`) para auditoria
- [ ] **Página de configurações de privacidade** em `/perfil/privacidade` para revisão pós-primeira-visita
- [ ] **Validade máxima** de cookies HTTP-only ajustada para respeitar LGPD (30 dias para sessão)

---

## 7. Histórico de Revisões

| Data | Versão | Alteração |
|------|--------|-----------|
| 2025-07 | 1.0 | Inventário inicial + implementação do Cookie Consent Manager |

---

*Revisar a cada 6 meses ou ao adicionar novos cookies/scripts de terceiros.*
