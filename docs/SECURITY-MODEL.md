# AxéMap — Modelo de Segurança

## Visão Geral

O AxéMap protege:
1. **Comunidades** — dados de localização, documentos, lideranças
2. **Usuários** — autenticação, privacidade, anti-doxxing
3. **Plataforma** — RBAC, rate limiting, auditoria, antifraude
4. **Sistema de Confiança** — independente de dinheiro/poder

---

## Camadas de Segurança

### Autenticação
- JWT (acesso curto) + Refresh Token (longo)
- bcrypt com fator de custo adequado
- Bloqueio de conta por admin
- Recuperação de senha com token de 2h

### Autorização (RBAC)
- 14 roles hierárquicos (VISITOR → SUPER_ADMIN)
- `RolesGuard` aplicado em todos os endpoints administrativos
- Least privilege: usuário só vê/edita seus próprios dados

### Rate Limiting
- Global: 100 req/60s (ThrottlerModule)
- Denúncias: 20 req/60s (proteção contra spam de denúncias)

### Privacidade de Localização
- 3 níveis: PUBLICO / APROXIMADA / PRIVADA
- `mascararLocalizacao()` aplicado em todas as respostas públicas
- Coordenadas sensíveis nunca em APIs públicas

### Proteção de Dados (LGPD)
- 5 níveis de privacidade: PUBLICO / COMUNITARIO / RESTRITO / PRIVADO / SENSIVEL
- Dados sensíveis (documentos, dados de menores) nunca expostos automaticamente
- Consentimento implícito no cadastro (a formalizar com DPO)

### Auditoria
- `AuditLogs` em todas as ações sensíveis
- Registro de: quem fez, o quê, quando, antes/depois
- Ações financeiras sempre auditadas

### Antifraude
- `AntifraudeRegistro` para detecção
- Estados: ABERTO / EM_REVISAO / REVISTO / DESCARTADO / BLOQUEADO
- Revisão humana obrigatória antes de bloqueios

---

## Proteção de Comunidades Religiosas

### Ameaças Específicas
- Intolerância religiosa e perseguição
- Exposição indevida de localização
- Falsos perfis e impersonificação
- Fraude em campanhas
- Doxxing de líderes religiosos

### Contramedidas
1. Localização controlada pelo responsável (PUBLICO/APROXIMADA/PRIVADA)
2. Documentos de verificação **nunca** publicados
3. Dados de lideranças com nivelPrivacidade controlável
4. Categoria INTOLERANCIA_RELIGIOSA em denúncias
5. Fluxo de denúncia com confidencialidade do denunciante
6. Reivindicação de perfil com validação de identidade

---

## Sistema de Denúncias

Princípios:
- Denunciante **nunca** é exposto publicamente
- Denúncia **não** é acusação pública automática
- Todo fluxo: DENÚNCIA → TRIAGEM → ANÁLISE → MEDIAÇÃO → DECISÃO → RECURSO
- Denúncias abusivas têm rate limit
- Bloqueios são cautelares e auditados

---

## Sistema de Trust (Independência)

**DINHEIRO NÃO COMPRA:**
- Trust Score
- Verificação
- Certificação
- Autoridade religiosa
- Posição orgânica
- Remoção de denúncias

**DINHEIRO COMPRA:**
- Serviços SaaS
- Publicidade claramente identificada
- Exposição publicitária rotulada

Testes automatizados garantem essa separação:
- `trust-money-separation.spec.ts`
- `ads-trust-separation.spec.ts`

---

## Endpoints Protegidos

| Padrão | Proteção |
|---|---|
| `/admin/*` | RolesGuard (ADMIN/SUPER_ADMIN) |
| `/apoie/contribuir` | AuthGuard('jwt') |
| `/ads/pedidos` | AuthGuard('jwt') |
| `/denuncias` | ThrottleGuard (20/60s) |
| `/webhooks/*` | Validação de assinatura |

---

## Status de Implementação

| Componente | Status |
|---|---|
| JWT + Refresh + Bloqueio | ✅ |
| RBAC (RolesGuard) | ✅ |
| Rate limiting global | ✅ |
| Localização segura (3 níveis) | ✅ |
| AuditLogs | ✅ |
| Antifraude (modelo) | ✅ |
| Denúncias com protocolo | ✅ |
| Trust/Dinheiro independentes | ✅ (testes) |
| 2FA | ⏳ Fase futura |
| Detecção comportamento suspeito | ⏳ Fase futura |
| WAF / IP allowlist | ⏳ Aguarda VPS |
| Pentest formal | ⏳ Pré-produção |
