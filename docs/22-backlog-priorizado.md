# 22 — Backlog Priorizado (MVP + Pós-MVP)

## Priorização: MoSCoW + Value/Effort

- **Must have (MVP):** Essencial para o lançamento
- **Should have (Sprint 11-20):** Importante, mas não bloqueia lançamento
- **Could have (Sprint 21-32):** Desejável se houver tempo
- **Won't have (Sprint 33+):** Futuro próximo

## MVP (Sprints 1-10) — Must Have

### Épico: Autenticação e Usuários
| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 1 | Cadastro de usuário (email + senha) | M | ⭐⭐⭐ | — |
| 2 | Login JWT (access + refresh token) | M | ⭐⭐⭐ | #1 |
| 3 | Login com Google OAuth | P | ⭐⭐ | #1 |
| 4 | Recuperação de senha | P | ⭐⭐ | #1 |
| 5 | Perfil do usuário (editar dados) | M | ⭐⭐ | #1 |
| 6 | RBAC básico (visitante, praticante, admin) | M | ⭐⭐⭐ | #1 |
| 7 | Consentimento LGPD (termos + cookies) | P | ⭐⭐⭐ | #1 |

### Épico: Busca e Descoberta
| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 8 | Página inicial com hero + busca | G | ⭐⭐⭐ | — |
| 9 | Busca por texto (cidade, estado, nome) | G | ⭐⭐⭐ | #19 |
| 10 | Mapa Leaflet com pins de terreiros | G | ⭐⭐⭐ | #19 |
| 11 | Geolocalização do usuário | M | ⭐⭐⭐ | #10 |
| 12 | Filtros básicos (cidade, estado, religião) | M | ⭐⭐⭐ | #9 |
| 13 | Filtros avançados (acessibilidade, visitantes, etc.) | G | ⭐⭐⭐⭐ | #12 |
| 14 | Autocomplete de busca | P | ⭐⭐ | #9 |
| 15 | Página de resultados (lista + mapa) | G | ⭐⭐⭐ | #9, #10 |

### Épico: Perfil do Terreiro
| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 16 | Cadastro de terreiro (formulário multi-step) | G | ⭐⭐⭐⭐ | — |
| 17 | Página pública do terreiro (slug) | G | ⭐⭐⭐⭐ | #16 |
| 18 | Fotos (upload + galeria) | M | ⭐⭐⭐ | #16 |
| 19 | Geolocalização do terreiro (Nominatim) | M | ⭐⭐⭐ | #16 |
| 20 | Horários de funcionamento | M | ⭐⭐⭐ | #16 |
| 21 | Contato (WhatsApp, Instagram, Facebook, Site) | P | ⭐⭐⭐ | #16 |
| 22 | "Como chegar" (link Google Maps) | P | ⭐⭐ | #19 |
| 23 | Vídeos (embed YouTube) | P | ⭐⭐ | #16 |

### Épico: Engajamento
| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 24 | Avaliações (nota + texto) | G | ⭐⭐⭐⭐ | #17, #1 |
| 25 | Favoritar terreiro | M | ⭐⭐⭐ | #17, #1 |
| 26 | Compartilhar (Open Graph + links) | P | ⭐⭐⭐ | #17 |
| 27 | Dashboard do usuário (meus favoritos) | M | ⭐⭐ | #25 |

### Épico: Administração e Moderação
| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 28 | Painel admin básico | G | ⭐⭐⭐ | #16, #24 |
| 29 | Aprovação/rejeição de terreiros | M | ⭐⭐⭐ | #28 |
| 30 | Moderação de avaliações | M | ⭐⭐⭐ | #28, #24 |
| 31 | Denúncia de conteúdo | P | ⭐⭐ | #24 |

## Sprint 11-20 — Should Have

| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 32 | Eventos (CRUD + calendário) | G | ⭐⭐⭐⭐ | #17 |
| 33 | Editar terreiro pelo dirigente | M | ⭐⭐⭐⭐ | #16 |
| 34 | Painel do terreiro (dashboard básico) | G | ⭐⭐⭐⭐ | #33 |
| 35 | Módulo Membros (SaaS básico) | G | ⭐⭐⭐⭐ | #34 |
| 36 | Módulo Agenda (SaaS básico) | G | ⭐⭐⭐⭐ | #34 |
| 37 | Planos e checkout (Stripe/Pix) | G | ⭐⭐⭐⭐⭐ | #34 |
| 38 | Login com GitHub OAuth | P | ⭐ | #1 |
| 39 | Notificações (email transacional) | M | ⭐⭐⭐ | #37 |
| 40 | SEO: sitemap.xml, robots.txt, meta tags | M | ⭐⭐⭐⭐ | #17 |
| 41 | Schema.org (JSON-LD para terreiros) | M | ⭐⭐⭐⭐ | #17 |
| 42 | LGPD: direito de exclusão + portabilidade | M | ⭐⭐⭐ | #1 |
| 43 | Rate limiting (Redis) | M | ⭐⭐⭐ | — |
| 44 | Audit logs | M | ⭐⭐⭐ | — |

## Sprint 21-32 — Could Have

| # | Item | Esforço | Valor | Depende |
|---|------|---------|-------|---------|
| 45 | Marketplace (catálogo + carrinho + checkout) | GG | ⭐⭐⭐⭐⭐ | #37 |
| 46 | Gestão financeira do terreiro (SaaS) | G | ⭐⭐⭐⭐ | #34 |
| 47 | Subdomínio personalizado (terreiro.axemap.com.br) | M | ⭐⭐⭐⭐ | #34 |
| 48 | Fórum da comunidade | G | ⭐⭐⭐ | #1 |
| 49 | Grupos de estudo | M | ⭐⭐⭐ | #48 |
| 50 | Feed de comunidade | G | ⭐⭐⭐⭐ | #48 |
| 51 | Mensagens diretas | M | ⭐⭐ | #50 |
| 52 | Cursos EAD (vídeo + material) | G | ⭐⭐⭐⭐ | #34 |
| 53 | PWA (instalação + offline básico) | M | ⭐⭐⭐⭐ | — |
| 54 | Notificações push (Firebase) | M | ⭐⭐⭐ | #53 |
| 55 | Múltiplos idiomas (i18n) | G | ⭐⭐⭐ | — |

## Sprint 33+ — Won't Have (Agora)

| # | Item | Esforço | Valor |
|---|------|---------|-------|
| 56 | Busca semântica (embeddings + pgvector) | G | ⭐⭐⭐⭐⭐ |
| 57 | Assistente IA (chatbot) | G | ⭐⭐⭐⭐ |
| 58 | Recomendação personalizada | G | ⭐⭐⭐⭐ |
| 59 | Moderação inteligente (IA) | G | ⭐⭐⭐⭐ |
| 60 | Match Terreiro-Usuário | M | ⭐⭐⭐⭐⭐ |
| 61 | App Mobile Nativo (React Native) | GG | ⭐⭐⭐⭐⭐ |
| 62 | API pública (dados abertos) | G | ⭐⭐⭐ |
| 63 | Enterprise (dados governo) | G | ⭐⭐⭐ |
| 64 | Calendário religioso inteligente | M | ⭐⭐⭐ |
| 65 | Lives (integração streaming) | M | ⭐⭐⭐ |
| 66 | Agenda Google Calendar sync | M | ⭐⭐⭐ |
| 67 | Certificados digitais para membros | M | ⭐⭐⭐ |
| 68 | White-label enterprise | G | ⭐⭐⭐⭐ |
