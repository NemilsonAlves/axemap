# AxéMap — Segurança dos Usuários

## Ameaças Específicas ao Ecossistema

O AxéMap protege comunidades religiosas e culturais que podem sofrer:
- Intolerância religiosa
- Perseguição e assédio
- Exposição indevida de localização
- Vandalismo digital e físico
- Falsos perfis e impersonificação
- Fraude em campanhas
- Doxxing e violação de privacidade
- Ataques coordenados

---

## Autenticação

| Mecanismo | Status |
|---|---|
| JWT (acesso) + Refresh Token | ✅ |
| Senha com bcrypt (fator de custo alto) | ✅ |
| Rate limiting em login (Throttler) | ✅ |
| Bloqueio de conta por admin | ✅ |
| Rejeição de JWT de conta bloqueada | ✅ |
| Recuperação de senha com token expirado (2h) | ✅ |
| Invalidação de refresh token no reset | ✅ |

---

## Rate Limiting

Configuração atual (`ThrottlerModule`):
- Global: 100 requisições / 60s por IP
- Denúncias: 20 requisições / 60s (Throttle específico)

**Pendente:**
- Rate limit específico para `/auth/login` (5 tentativas/5min)
- Rate limit para `/auth/forgot-password` (3/hora)
- Rate limit por IP para registro

---

## Bloqueio de Contas

Fluxo:
```
ADMIN BLOQUEIA CONTA
↓ usuario.bloqueadoEm = now, motivoBloqueio = motivo
↓
LOGIN TENTADO
↓ AuthService verifica bloqueadoEm
↓ Lança UnauthorizedException
↓
JWT VÁLIDO USADO
↓ JwtStrategy verifica bloqueadoEm
↓ Lança UnauthorizedException
```

---

## Proteção contra Enumeração

- Mensagens de erro de login são genéricas ("Credenciais inválidas")
- Recuperação de senha retorna sucesso mesmo se e-mail não existir
- IDs internos não são expostos em URLs públicas quando há slug

---

## Gestão de Sessões

- Refresh token armazenado como hash no banco
- Logout invalida refresh token
- Reset de senha invalida refresh token
- Contas bloqueadas têm JWT rejeitado na validação

---

## Proteção contra IDOR

- Usuários só acessam seus próprios dados sem role ADMIN
- `detalhePedido` em ADS verifica `anuncianteId === usuarioId` ou isAdmin
- Contribuições de apoio: `/apoie/minhas-contribuicoes` filtra por `apoiadorId === usuario.id`
- Denúncias: `/denuncias/me` filtra por `criadoPorId === usuario.id`

---

## Permissões (RBAC)

| Role | Nível |
|---|---|
| VISITOR | Leitura pública |
| PRACTITIONER / DIRIGENTE / etc. | Conteúdo próprio |
| CO_ADMIN | Gestão do terreiro |
| CURATOR | Curadoria de conteúdo |
| MODERATOR | Moderação |
| VERIFIER | Verificação |
| SUPPORT | Suporte |
| ADMIN | Acesso administrativo |
| SUPER_ADMIN | Acesso total |

Ações sensíveis (financeiras, de bloqueio) geram `AuditLog`.

---

## Proteção contra Intolerância Religiosa

- Categoria `INTOLERANCIA_RELIGIOSA` em `DenunciaMotivo`
- Rate limit em denúncias para prevenir uso como ferramenta de perseguição
- Denunciante nunca é exposto publicamente
- Denúncia não gera acusação pública automática
- Fluxo: DENÚNCIA → TRIAGEM → ANÁLISE → MEDIAÇÃO → DECISÃO

---

## Proteção de Dados de Menores

- Campo `nivelPrivacidade: SENSIVEL` para dados de menores
- Dados sensíveis nunca são expostos automaticamente
- Upload de documentos com menores é tratado como dado sensível

---

## Status de Implementação

| Componente | Status |
|---|---|
| JWT + Refresh + Bloqueio | ✅ |
| Rate limiting global | ✅ (100/60s) |
| Bloqueio de conta admin | ✅ |
| Recuperação de senha segura | ✅ |
| IDOR em ADS e Apoios | ✅ |
| RBAC (RolesGuard) | ✅ |
| AuditLogs em ações sensíveis | ✅ |
| Rate limiting específico por endpoint | ⏳ Pendente |
| 2FA | ⏳ Fase futura |
| Detecção de comportamento suspeito | ⏳ Fase futura |
| Login audit log automático | ⏳ Pendente |
