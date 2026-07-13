# 06 — Roadmap

## Fases do Projeto

### Fase 0: Fundação (Semanas 1-4)
**Setup do projeto, arquitetura e design**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S1 | Setup monorepo, Docker, CI/CD, ambiente dev/staging/prod | Repositório configurado, deploy automático |
| S2 | Design System (cores, tipografia, componentes Shadcn customizados) | Figma / Storybook |
| S3 | Modelagem do banco, Prisma schema, migrations iniciais | Schema validado, migrations rodando |
| S4 | Auth module (cadastro, login, JWT, OAuth, RBAC) | Autenticação funcional |

### Fase 1: MVP Core (Semanas 5-10)
**Diretório + Busca + Perfil**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S5 | Cadastro de terreiro (formulário multi-step) | API + UI de cadastro |
| S6 | Busca geográfica (Leaflet + OpenStreetMap) | Mapa com pins e busca por localização |
| S7 | Perfil do Terreiro (fotos, descrição, horários, contato) | Página pública do terreiro |
| S8 | Filtros avançados (religião, acessibilidade, etc.) | Filtros funcionais na busca |
| S9 | Galeria de fotos e vídeos (upload + Cloudflare R2) | Galeria funcional |
| S10 | Avaliações e comentários | Sistema de reviews |

### Fase 2: Engajamento (Semanas 11-14)
**Eventos, favoritos, compartilhamento**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S11 | Calendário de eventos (criação + visualização) | Calendário + agenda |
| S12 | Favoritos + Wishlist | Salvos do usuário |
| S13 | Compartilhamento (links + Open Graph + Social) | Compartilhamento funcional |
| S14 | Dashboard do usuário (meus favoritos, avaliações, histórico) | Perfil do usuário |

### Fase 3: SaaS (Semanas 15-20)
**Painel do Terreiro + Planos**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S15 | Painel do dirigente (subdomínio: terreiro.axemap.com.br) | Multi-tenant habilitado |
| S16 | Módulo Membros (cadastro, cargos, permissões) | Gestão de membros |
| S17 | Módulo Agenda (eventos, giras, compromissos) | Agenda funcional |
| S18 | Módulo Financeiro básico (Pix, doações, controle) | Financeiro básico |
| S19 | Planos e checkout (Stripe/Pix) + subdomínio customizado | Monetização ativa |
| S20 | Notificações push + WhatsApp integrado | Comunicação |

### Fase 4: Marketplace (Semanas 21-26)
**Loja de artigos religiosos**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S21 | Cadastro de vendedores + verificação | Onboarding sellers |
| S22 | Catálogo de produtos (categorias, variantes, estoque) | Catálogo funcional |
| S23 | Carrinho + checkout (Pix, cartão, boleto) | Checkout funcional |
| S24 | Gestão de pedidos para vendedores | Painel do vendedor |
| S25 | Avaliações de produtos + reputação | Reviews de produtos |
| S26 | Integração com correios + logística | Frete calculado |

### Fase 5: Comunidade (Semanas 27-32)
**Rede social + Fórum + Grupos**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S27 | Feed de comunidade | Timeline |
| S28 | Grupos temáticos | Grupos funcionais |
| S29 | Fórum de perguntas e respostas | Fórum funcional |
| S30 | Mensagens diretas | Chat funcional |
| S31 | Lives (integração YouTube/Streaming) | Lives |
| S32 | Moderação comunitária | Reports + moderação |

### Fase 6: IA + APIs (Semanas 33-38)
**Inteligência artificial + ecossistema**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S33 | Assistente IA (FAQ, orientação sobre religiões) | Chatbot no site |
| S34 | Busca inteligente semântica (embedding + pgvector) | Busca por relevância |
| S35 | Recomendação de terreiros baseada em perfil | Recomendador |
| S36 | Calendário religioso inteligente (datas de cada tradição) | Calendário integrado |
| S37 | APIs públicas (REST + GraphQL) | Documentação + playground |
| S38 | Moderação inteligente (IA para reviews e conteúdo) | Moderação automática |

### Fase 7: Mobile + Enterprise (Semanas 39-48)
**App nativo + plano enterprise**

| Semana | Atividades | Entregas |
|--------|-----------|----------|
| S39-42 | App React Native (iOS + Android) | App publicado nas lojas |
| S43-44 | Push notifications + offline mode | App completo |
| S45-46 | Plano Enterprise (licenciamento de dados, RBAC avançado) | Enterprise ativo |
| S47-48 | Performance tuning, testes de carga, disaster recovery, documentação | Sistema em regime |

## Marcos Estratégicos (Milestones)

| Milestone | Data | Meta |
|-----------|------|------|
| M0: MVP Lançado | Semana 10 | 100 terreiros, 1000 usuários |
| M1: Primeira Monetização | Semana 19 | MRR R$ 5k (10 terreiros pagantes) |
| M2: Marketplace Ativo | Semana 26 | 50 sellers, 500 produtos |
| M3: Comunidade Viva | Semana 32 | 1000 posts, 200 grupos |
| M4: IA Operacional | Semana 38 | Chatbot com 80% de acerto |
| M5: App Lançado | Semana 42 | 10k downloads |
| M6: Breakeven | Semana 48 | MRR > custos operacionais |
