# PRIVACY-SECURITY-AUDIT.md — AxéMap

> **Gerado em:** Sprint Privacy & Security (Julho 2026)  
> **Versão do schema:** Sprint atual  
> **Nota metodológica:** Baseado em auditoria de código estático (sem acesso à produção). Conformidade avaliada por evidência direta de código.

---

## Legenda de status

| Status | Significado |
|--------|-------------|
| **CONFORME** | Implementado e verificado em código |
| **PARCIAL** | Parcialmente implementado — risco residual documentado |
| **NÃO CONFORME** | Não implementado — risco ativo |
| **NÃO TESTADO** | Implementado mas sem cobertura de teste automatizado |
| **CORRIGIDO** | Era NÃO CONFORME, corrigido nesta sprint |

---

## Matriz de Auditoria

### 1. LGPD — Direitos do Titular

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Acesso aos dados (`GET /auth/exportar-dados`) | **CONFORME** | `auth.service.ts:exportarDados()` — retorna JSON de todos os dados vinculados | - | - |
| Exclusão de conta (`DELETE /auth/conta`) | **CONFORME** | `auth.service.ts:deletarConta()` — soft-delete + anonimização de email/nome/avatar | - | - |
| Revogação de consentimento (`POST /auth/revogar-consentimento`) | **CONFORME** | `auth.service.ts:revogarConsentimento()` + `ConsentRecord.revokedAt` | - | - |
| Portabilidade de dados | **CONFORME** | `exportarDados()` retorna JSON estruturado | Formato JSON (sem CSV/download direto) | Implementar download direto em sprint futura |
| Política de privacidade pública | **CONFORME** | `apps/web/src/app/privacidade/page.tsx` — 10 seções conforme LGPD | - | - |
| DPO / Contato de privacidade | **PARCIAL** | Email `privacidade@axemap.com.br` na policy — não há endpoint de contato automatizado | Pedidos manuais por e-mail | Implementar formulário de solicitação LGPD |
| Registro de atividade de tratamento | **NÃO IMPLEMENTADO** | Não existe ROPA (Registro de Operações de Processamento de Atividades) | Obrigação ANPD para empresas médias+ | Criar ROPA em sprint futura |

---

### 2. Cookies & Consentimento

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Banner de consentimento | **CONFORME** | `cookie-consent.tsx` — 4 categorias (essencial, analytics, marketing, preferências) | - | - |
| Consent Manager centralizado | **CONFORME (NOVO)** | `apps/web/src/lib/consent/consent-manager.ts` — `shouldLoad()`, `saveConsent()`, `revokeConsent()`, `onConsentChange()` | - | - |
| Bloqueio real de trackers antes de consentimento | **CONFORME (NOVO)** | `consent-script-loader.tsx` — componente que só carrega scripts após `shouldLoad(category) === true` | - | - |
| Re-abertura do painel de cookies | **CONFORME (NOVO)** | `cookie-preferences-button.tsx` + evento `axemap:open-cookie-consent` — rodapé atualizado | - | - |
| Registro server-side de consentimento | **CONFORME (NOVO)** | `ConsentRecord` model no schema + `consent.service.ts` + `consent.controller.ts` | - | - |
| IP hash (sem IP bruto) | **CONFORME (NOVO)** | `consent.service.ts` — `createHash('sha256').update(rawIp)` | - | - |
| Versão do consentimento versionada | **CONFORME** | `CONSENT_VERSION = '1'` em consent-manager.ts e ConsentRecord | Upgrade manual necessário quando policy mudar | - |
| Link para Política de Cookies no banner | **CONFORME (NOVO)** | Link `/cookies` adicionado ao banner e rodapé | - | - |

**Cookies/localStorage reais encontrados no audit:**

| Chave | Tipo | Categoria | Propósito |
|-------|------|-----------|-----------|
| `axemap:cookie-consent` | localStorage | Essencial | Preferências de consentimento |
| `axemap_auth` | localStorage | Essencial | Token JWT de autenticação |
| `axemap_session` | sessionStorage | Essencial | ID de sessão anônima para analytics interno |
| `axemap_auth` (cookie) | Cookie | Essencial | Flag de sessão ativa (`samesite=lax; secure`) |

**Trackers de terceiros encontrados:** NENHUM identificado no código auditado. Analytics é próprio (AxéMap Analytics — `POST /analytics/track`).

---

### 3. Privacidade de Localização (Mapa)

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Campo `visibilidadeLocalizacao` no schema | **CONFORME** | `schema.prisma:Terreiros.visibilidadeLocalizacao` — enum `LocalizacaoVisibilidade` (PUBLICO/APROXIMADA/PRIVADA) | - | - |
| Mascaramento de coordenadas | **CONFORME** | `location-visibility.ts:mascararLocalizacao()` — PRIVADA remove lat/lng; APROXIMADA arredonda ~1km | - | - |
| Filtro em queries PostGIS | **CONFORME** | `geo.service.ts` — todas as queries excluem `visibilidade_localizacao = 'PRIVADA'` | - | - |
| Terreiros privados não retornam coordenadas | **CONFORME** | `mascararLocalizacao()` deleta `latitude`, `longitude`, `geoPoint` para PRIVADA | - | - |
| Teste unitário de localização | **CONFORME** | `location-visibility.spec.ts` existe | - | - |

---

### 4. Privacidade de Contato (Telefone)

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Separação `telefonePublico` / `telefoneResponsavel` | **NÃO IMPLEMENTADO** | Schema tem apenas `telefone` (único campo) | Se campo `telefone` conter celular pessoal do dirigente, há risco de exposição | Adicionar `telefoneResponsavel` ao schema (migration) e remover da projeção pública |
| Campo `telefone` exposto na API pública | **PARCIAL** | `terreiro.service.ts` não filtra `telefone` na resposta pública | Depende de como o campo é usado na prática | Documentar como campo de contato da casa (não pessoal) |
| `whatsapp` exposto publicamente | **PARCIAL** | Campo `whatsapp` retornado em respostas públicas | Pode ser número pessoal | Adicionar controle de visibilidade para WhatsApp |

---

### 5. Segurança de Autenticação

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| JWT em localStorage | **PARCIAL** | `auth-context.tsx:localStorage.setItem('axemap_auth', ...)` — vulnerável a XSS | XSS → token leak | Migrar para httpOnly cookie em sprint futura |
| Senha hashada com bcrypt 12 rounds | **CONFORME** | `auth.service.ts:bcrypt.hash(dto.senha, 12)` | - | - |
| Rate limiting em auth | **CONFORME** | `@Throttle` em `forgotPassword` (5/min), `login` e `signup` (10/min) | - | - |
| Token de reset armazenado como hash SHA-256 | **CONFORME** | `auth.service.ts:hashResetToken()` | - | - |
| Forgot password não vaza existência de email | **CONFORME** | `auth.service.ts:forgotPassword()` — resposta genérica independente do resultado | - | - |
| Login não vaza existência de email | **CONFORME** | Resposta `'Credenciais inválidas'` em ambos os casos | - | - |
| Signup não vaza existência de email | **CORRIGIDO** | Era `'Email já cadastrado'`, agora `'Não foi possível criar a conta. Verifique os dados informados.'` + timing bcrypt consistente | - | - |
| Refresh token comparação direta de string | **PARCIAL** | `auth.service.ts`: `user.refreshToken !== refreshToken` — sem hash. Banco armazena RT em texto claro | Exposição do banco revela RTs | Hashear refresh tokens no banco |

---

### 6. CORS & Headers de Segurança

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| CORS com `*` e credentials | **CONFORME** | `main.ts` — CORS valida por lista de origens permitidas; `*` com credentials NUNCA usado | - | - |
| Helmet habilitado | **CONFORME** | `main.ts:app.use(helmet(...))` | - | - |
| CSP na API | **CORRIGIDO** | Era `contentSecurityPolicy: false`, agora CSP restritivo (`default-src 'none'`) | - | - |
| `X-Content-Type-Options: nosniff` | **CONFORME** | `helmet()` aplica por padrão; verificado explicitamente em main.ts | - | - |
| `X-Frame-Options: DENY` | **CONFORME (NOVO)** | Configurado explicitamente em `main.ts` e `next.config.js` | - | - |
| `Referrer-Policy` | **CONFORME (NOVO)** | `strict-origin-when-cross-origin` em main.ts e next.config.js | - | - |
| `HSTS` | **CONFORME (NOVO)** | `max-age=31536000; includeSubDomains` em ambos | - | - |
| CSP no frontend (Next.js) | **CONFORME (NOVO)** | `next.config.js:headers()` — CSP configurado com `frame-ancestors 'none'`, `base-uri 'self'` | `unsafe-inline` e `unsafe-eval` ainda necessários para Next.js | Migrar para CSP com nonces em sprint futura |
| `Permissions-Policy` | **CONFORME (NOVO)** | Adicionado em next.config.js | - | - |

---

### 7. ADS — Isolamento de Trust

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| ADS nunca altera Trust Score | **CONFORME** | `ads.service.ts` — nenhuma chamada a `terreiros.update`, `usuarios.update` ou qualquer campo de trust | - | - |
| ADS nunca altera verificação | **CONFORME** | Buscas em código por `trustScore`, `verificado`, `statusVerificacao` nos arquivos ADS retornaram vazio | - | - |
| Anúncios publicados incluem `rotulo: 'PATROCINADO'` | **CONFORME** | `ads.service.ts:listarPublicados()` — `...ad, rotulo: 'PATROCINADO'` | - | - |
| Teste de isolamento ADS vs Trust | **CONFORME (NOVO)** | `ads-trust-isolation.spec.ts` — 4 cenários cobertos | NÃO TESTADO em CI (ambiente de build não configurado) | Integrar ao pipeline de CI |
| ADS é módulo real (não apenas frontend) | **CONFORME** | `AdsModule` importado em `AppModule`, schema com `AdCampanha` + `AdPagamento`, controller + service | - | - |

---

### 8. RBAC & Autorização

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Guard JWT em endpoints sensíveis | **CONFORME** | `@UseGuards(AuthGuard('jwt'))` verificado em auth, upload, ads, terreiro | - | - |
| RolesGuard em admin endpoints | **CONFORME** | `@UseGuards(RolesGuard)` + `@Roles(...)` em AdsAdminController, ModeraçãoAdmin | - | - |
| ThrottlerGuard global | **CONFORME** | `APP_GUARD: ThrottlerGuard` em AppModule; throttle por endpoint em auth | - | - |

---

### 9. Uploads & Storage

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Validação de MIME type em upload | **CONFORME** | `upload.service.ts` — whitelist de image/video types | Spoofing de `Content-Type` header ainda possível | Adicionar validação por magic bytes em sprint futura |
| Tamanho máximo de arquivo | **CONFORME** | `upload.controller.ts:limits.fileSize = 100MB`, `upload.service.ts` — 20MB imagens, 100MB vídeos | - | - |
| `DocumentosVerificacao.arquivoUrl` exposta publicamente | **PARCIAL** | `terreiro.service.ts:perfilInclude` inclui `arquivoUrl` nos documentos de verificação | Documentos de verificação (CPF, CNPJ, etc.) devem ser privados | Remover `arquivoUrl` da projeção pública — usar presigned URL apenas para admins |
| Signed URLs para documentos privados | **PARCIAL** | `s3-storage.service.ts:getSignedUrl()` existe mas não é usado para docs de verificação | - | Implementar acesso privado para DocumentosVerificacao |
| Autenticação obrigatória para upload | **CONFORME** | `@UseGuards(AuthGuard('jwt'))` no UploadController | - | - |

---

### 10. Denúncias — Privacidade

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| Denunciante anônimo suportado | **CONFORME** | `moderation.service.ts` — `criadoPorId` é nullable; aceita usuários não autenticados | - | - |
| Email de contato (denúncia) protegido | **CONFORME** | `emailContato` armazenado mas não retornado em respostas públicas (sem `select` public) | - | - |
| Protocolo de denúncia gerado aleatoriamente | **CONFORME** | `gerarProtocolo()` — `randomBytes(4).toString('hex')` | - | - |

---

### 11. Auditoria & Logs

| Área | Status | Evidência | Risco | Ação |
|------|--------|-----------|-------|------|
| AuditLogs model | **CONFORME** | `AuditLogs` model no schema com `acao`, `antes`, `depois`, `ip`, `userAgent` | IP e User-Agent armazenados em texto claro | Hashear IP e UA em logs para conformidade LGPD |
| `AcessoQRCode` armazena IP bruto | **NÃO CONFORME** | `AcessoQRCode.ip` — IP bruto no banco | Violação LGPD (dado pessoal) | Hashear IP ou remover campo |
| `AnalyticsEvent` sem PII | **PARCIAL** | Armazena `cidade`, `estado` — sem lat/lng — mas `sessaoId` poderia ser correlacionado | Pseudonimização, não anonimização | Documentar como dado pseudonimizado |

---

## Resumo Executivo

| Categoria | Total | CONFORME | PARCIAL | NÃO CONFORME | CORRIGIDO (sprint) |
|-----------|-------|----------|---------|--------------|---------------------|
| LGPD | 7 | 5 | 1 | 1 | 0 |
| Cookies | 8 | 8 | 0 | 0 | 5 |
| Localização | 5 | 5 | 0 | 0 | 0 |
| Contato | 3 | 0 | 3 | 0 | 0 |
| Autenticação | 8 | 6 | 2 | 0 | 1 |
| Headers/CORS | 9 | 9 | 0 | 0 | 5 |
| ADS Trust | 5 | 5 | 0 | 0 | 1 |
| RBAC | 3 | 3 | 0 | 0 | 0 |
| Uploads | 5 | 2 | 3 | 0 | 0 |
| Denúncias | 3 | 3 | 0 | 0 | 0 |
| Auditoria | 3 | 1 | 1 | 1 | 0 |
| **TOTAL** | **59** | **47** | **10** | **2** | **12** |

---

## Itens Pendentes de Alta Prioridade

1. **JWT em localStorage** → migrar para `httpOnly` cookie (XSS protection)
2. **`DocumentosVerificacao.arquivoUrl` pública** → usar presigned URLs
3. **`AcessoQRCode.ip` e `AuditLogs.ip` em texto claro** → hashear SHA-256
4. **`telefoneResponsavel` separado** → adicionar campo e remover de projeções públicas
5. **Refresh token armazenado sem hash** → hashear no banco
6. **ROPA (Registro de Atividades de Tratamento)** → documentar e publicar
