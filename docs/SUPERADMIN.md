# SuperAdmin Console Central — AxéMap 2.1

Console administrativo consolidado, protegido por RBAC no **backend** (nunca apenas no frontend) e com trilha de auditoria imutável em todas as ações sensíveis.

## Acesso

| Rota | Recurso | Papéis |
|---|---|---|
| `/admin` | Dashboard com dados reais | `ADMIN`, `SUPER_ADMIN` |
| `/admin/central` | Central de moderação (9 abas legadas) | `ADMIN`, `SUPER_ADMIN` |
| `/admin/usuarios` | Gestão de contas | `ADMIN`, `SUPER_ADMIN` (role só `SUPER_ADMIN`) |
| `/admin/mapa` | Distribuição geográfica | `ADMIN`, `SUPER_ADMIN` |
| `/admin/auditoria` | Trilha de auditoria | `ADMIN`, `SUPER_ADMIN` |
| `/admin/integracoes` | Status dos serviços | `ADMIN`, `SUPER_ADMIN` |
| `/admin/jobs` | Fila de ações pendentes | `ADMIN`, `SUPER_ADMIN` |
| `/admin/axegraph` | Governança da Rede Axé Graph | `ADMIN`, `SUPER_ADMIN` |
| `/admin/impacto` | Campanhas de impacto | `ADMIN`, `SUPER_ADMIN` |
| `/admin/transparencia` | Trust Score e governança | `ADMIN`, `SUPER_ADMIN` |
| `/admin/system` | Health, metrics e versão | `ADMIN`, `SUPER_ADMIN` |

O layout `/admin/layout.tsx` redireciona não-administradores e protege **todas** as rotas abaixo de `/admin`.

## Regras de Segurança (imutáveis)

1. **RBAC no backend** — todo controller admin usa `RolesGuard` + `@Roles(ADMIN, SUPER_ADMIN)`.
2. **Nunca expor** `senhaHash`, `refreshToken` ou segredos em respostas de API.
3. **Ações críticas geram auditoria** (`AuditLogsService.registrar`) com IP e user agent.
4. **Usuários bloqueados** são rejeitados no login, refresh e em toda requisição autenticada (JWT strategy).
5. **Apenas `SUPER_ADMIN`** concede ou altera papéis administrativos (`ADMIN`/`SUPER_ADMIN`).

## Bloqueio de conta

Quando um administrador bloqueia um usuário:

- campos `bloqueado_em` + `motivo_bloqueio` são gravados (`20260813120000_add_usuarios_bloqueio`);
- o `refresh_token` é limpo (sessões invalidadas imediatamente);
- o `JwtStrategy` rejeita o usuário com `401 Usuário bloqueado`;
- o login e o refresh rejeitam com a mesma mensagem;
- a ação fica registrada como `USUARIO_BLOQUEAR` na auditoria.

Desbloqueio limpa os campos e gera `USUARIO_DESBLOQUEAR`.

## Endpoints novos

### Dashboard (dados reais)
`GET /api/v1/admin/dashboard`

Contagens agregadas reais: usuários (por papel, verificados, bloqueados, novos 7d/30d), terreiros (por status, top trust score), organizações, eventos, avaliações, denúncias, cursos/matrículas/conteúdos/ações sociais/feedbacks/certificados, membros/seguidores/notificações/indicações, mediações, campanhas (arrecadação), assinaturas e financeiro (receitas/despesas), entidades e relações do grafo, conteúdo cultural, patrimônio, feature flags e últimos eventos de auditoria.

### Usuários
| Endpoint | Ação |
|---|---|
| `GET /admin/usuarios` | Lista com busca `q`, filtros `role` e `status` (`ATIVO`/`BLOQUEADO`), paginado |
| `GET /admin/usuarios/:id` | Detalhe com contagem de conteúdo criado (sem segredos) |
| `POST /admin/usuarios/:id/bloquear` | Bloqueia (exige `motivo`) → auditoria |
| `POST /admin/usuarios/:id/desbloquear` | Desbloqueia → auditoria |
| `PATCH /admin/usuarios/:id/role` | Altera papel (regras de privilégio) → auditoria |

### Monitoramento
| Endpoint | Conteúdo |
|---|---|
| `GET /admin/mapa` | Terreiros por estado/cidade, entidades do grafo sem coordenadas |
| `GET /admin/integracoes` | Status real (DB, Redis, Storage) + configuração de e-mail, WhatsApp, mapas, IA, OAuth, pagamentos |
| `GET /admin/jobs` | Backlog real de ações pendentes (denúncias, reivindicações, docs, mediações, campanhas) |

### Moderação
| Endpoint | Ação |
|---|---|
| `GET /admin/eventos` | Lista eventos ativos/arquivados |
| `POST /admin/eventos/:id/arquivar` / `restaurar` | Arquiva/restaura → auditoria |
| `GET /admin/organizacoes` | Lista organizações |
| `POST /admin/organizacoes/:id/publicar` / `arquivar` | Publica/arquiva → auditoria |
| `GET /admin/avaliacoes` | Lista avaliações (filtro por nota e ocultas) |
| `POST /admin/avaliacoes/:id/ocultar` / `restaurar` | Oculta/restaura → auditoria |

## Frontend

- `apps/web/src/app/admin/layout.tsx` — sidebar (desktop) + sheet (mobile) com todas as rotas; gate por papel.
- `apps/web/src/lib/admin-client.ts` — cliente tipado dos endpoints admin.
- `/admin` — dashboard real (StatCards, distribuição por papel/status, top trust, auditoria recente).
- `/admin/usuarios` — busca, filtros, bloqueio com motivo, desbloqueio, troca de papel e detalhe expandido.
- O monólito legado de moderação (9 abas) foi movido intacto para `/admin/central`.

## Segurança corrigida

- **Feature Flags**: endpoints de escrita (`POST /feature-flags`, `PATCH /feature-flags/:id`, `POST /feature-flags/overrides`) agora exigem `ADMIN`/`SUPER_ADMIN` — antes apenas autenticado.
- **`/admin/system`**: passa a ser protegido pelo layout admin (antes sem guard).

## Testes

- `apps/api/src/admin/usuarios-admin.service.spec.ts` — 11 casos (bloqueio, desbloqueio, roles, privilégios, segredos).
- `apps/api/src/admin/dashboard-admin.service.spec.ts` — agregações reais e nulos.
- `apps/api/src/admin/moderacao-admin.service.spec.ts` — eventos/organizações/avaliações.
- `apps/api/src/auth/auth.service.spec.ts` — bloqueio no login e refresh.
