# PRIVACY-TEST-REPORT.md — AxéMap

> Versão 1.0 — Julho 2026

---

## Testes Automatizados Existentes

| Arquivo | Tipo | Cobertura | Status |
|---------|------|-----------|--------|
| `apps/api/src/auth/auth.service.spec.ts` | Unit | auth.service | NÃO TESTADO (arquivo existe, conteúdo pendente) |
| `apps/api/src/common/utils/location-visibility.spec.ts` | Unit | mascararLocalizacao() | EXISTE — conteúdo a verificar |
| `apps/api/src/ads/ads-trust-isolation.spec.ts` | Unit | ADS Trust Isolation | CRIADO nesta sprint — não executado em CI |

---

## Testes Pendentes (alta prioridade)

| Cenário | Tipo | Prioridade | Arquivo Sugerido |
|---------|------|-----------|-----------------|
| `exportarDados()` retorna apenas dados do próprio usuário | Unit | Alta | `auth.service.spec.ts` |
| `deletarConta()` anonimiza corretamente | Unit | Alta | `auth.service.spec.ts` |
| `revogarConsentimento()` marca `revokedAt` | Unit | Alta | `auth.service.spec.ts` |
| `forgotPassword()` resposta genérica (anti-enum) | Unit | Alta | `auth.service.spec.ts` |
| `signup()` não revela email existente | Unit | Alta | `auth.service.spec.ts` |
| Coordenadas PRIVADAS não retornam lat/lng | Unit | Alta | `location-visibility.spec.ts` |
| Coordenadas APROXIMADAS arredondadas ~1km | Unit | Alta | `location-visibility.spec.ts` |
| Documentos de verificação privados (não público) | Integration | Alta | `upload.e2e.spec.ts` |
| ConsentRecord armazena IP como hash | Unit | Média | `consent.service.spec.ts` |
| CORS rejeita origens não autorizadas | E2E | Média | `cors.e2e.spec.ts` |
| Rate limiting auth endpoints | E2E | Média | `auth.e2e.spec.ts` |
| JWT expirado retorna 401 | E2E | Média | `auth.e2e.spec.ts` |
| Refresh token inválido retorna 401 | Unit | Média | `auth.service.spec.ts` |
| Admin endpoints bloqueados para VISITOR | Integration | Alta | `rbac.e2e.spec.ts` |

---

## Resultados dos Testes Manuais

> Auditoria estática de código — sem ambiente de execução ativo.

| Check | Resultado |
|-------|-----------|
| Schema Prisma válido | ✅ `prisma validate` passou |
| Import de ConsentModule no AppModule | ✅ Verificado |
| Novos endpoints auth compilam | NÃO TESTADO — aguardar `tsc --noEmit` |
| Cookie consent reopen event | NÃO TESTADO em browser |
| `next.config.js` headers sintaxe | NÃO TESTADO em build |

---

## Cobertura Estimada de Privacidade

| Área | Cobertura de Testes |
|------|---------------------|
| LGPD direitos do titular | 0% (testes pendentes criados) |
| Localização / privacidade de mapa | Parcial (spec existe) |
| ADS Trust Isolation | 4 cenários criados (não executados em CI) |
| Autenticação / anti-enumeração | 0% (testes pendentes) |
| Consentimento | 0% (testes pendentes) |
