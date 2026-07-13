# 25 — Decisões, Questionamentos e Próximos Passos

## Decisões Tomadas

### Arquiteturais

| Decisão | Opção Escolhida | Alternativas Consideradas | Motivo |
|---------|----------------|--------------------------|--------|
| **Monorepo** | Turborepo | Repositórios separados | Compartilhamento de tipos, CI unificado, facilidade de desenvolvimento |
| **ORM** | Prisma | TypeORM, Drizzle, Knex | Type-safety nativa, migrations simples, comunidade grande |
| **Banco** | PostgreSQL | MySQL, MongoDB, SQLite | Maturidade, PostGIS, pgvector, RLS, JSONB |
| **Cache** | Redis | Memcached, Varnish | Filas (BullMQ), cache, sessões — tudo no mesmo lugar |
| **API** | REST + GraphQL | GraphQL puro, REST puro | REST para CRUD simples, GraphQL para buscas complexas |
| **Frontend** | Next.js 16 | Remix, SPA React, SvelteKit | SSR/SSG/ISR, SEO, ecossistema maduro |
| **Mapa** | Leaflet + OSM | Google Maps, Mapbox | Gratuito, sem lock-in, sem custo variável |
| **Auth** | JWT + OAuth | Session-based, Magic Links | Stateless, escala horizontalmente |
| **Multi-tenant** | Row-Level Security | Schema-per-tenant, DB-per-tenant | Custo inicial baixo, RLS nativo do PostgreSQL, migração futura possível |

### Produto

| Decisão | Opção | Motivo |
|---------|-------|--------|
| **Neutralidade religiosa** | Não favorecer vertentes | Diferencial competitivo vs. plataformas cristãs que dominam ChMS |
| **Freemium agressivo** | Plano grátis generoso | Acelera adoção, reduz barreira, cria base para upselling |
| **Moderação híbrida** | IA + comunidade + humana | Escalabilidade sem perder qualidade |
| **PWA primeiro** | PWA antes do app nativo | Reduz custo inicial, cobre 90% das necessidades |
| **LGPD nativa** | Consentimento desde o cadastro | Dado sensível exige cuidado desde o início |

## Questionamentos para o Cliente/Time

### Estratégicos

1. **Nome definitivo:** AxéMap é o nome final ou devemos pensar em alternativas? Sugestões: AxéFinder, AxéConecta, RaizDigital, AxéHub, AxéBrasil.
2. **Posicionamento de marca:** A plataforma deve ter uma identidade visual que remeta às religiões afro (cores, símbolos) ou deve ser mais neutra/corporativa?
3. **CNPJ e modelo societário:** MEI para teste ou abrir LTDA desde o início? Precisamos de contador especializado?
4. **Primeiro investimento:** Bootstrap (dinheiro próprio), buscar investidor anjo, ou edital de fomento à cultura afro?
5. **Parcerias estratégicas:** Devemos buscar federações (FBU, FBC) antes do lançamento para endorsement?

### Técnicos

6. **Qualidade dos dados OSM no Brasil:** OpenStreetMap tem boa cobertura nas cidades? Precisamos de fallback?
7. **Processador de pagamento:** Stripe é a melhor opção para Pix? Asaas e PagSeguro têm melhor suporte Pix no Brasil.
8. **Hospedagem do banco:** Neon (serverless Postgres), Supabase, RDS, ou VPS com Docker?
9. **Email transacional:** Resend, AWS SES, SendGrid, ou Mailgun? Qual tem melhor entregabilidade no Brasil?
10. **Monitoramento:** Sentry (pago) ou ferramentas open-source (Sentry self-hosted + Grafana)?

### Produto

11. **Verificação de terreiros:** Quem verifica? Nós (curadoria central), a comunidade (peer review), ou ambos?
12. **Conteúdo inicial:** Vamos cadastrar terreiros manualmente para "seedar" a plataforma ou esperar cadastro orgânico?
13. **Prioridade pós-MVP:** O que vem primeiro — SaaS (monetização) ou Marketplace (receita)? Sugiro SaaS primeiro pois gera MRR mais previsível.
14. **Tolerância religiosa:** Qual o limite da moderação? Posts criticando outra religião são permitidos? Sugiro: críticas doutrinárias sim, discurso de ódio não.
15. **Dados do IBGE:** Devemos usar os dados do Censo 2022 no marketing? "1.85M de brasileiros" como prova de mercado.

## Próximos Passos Recomendados

### Imediatos (antes de codificar)

1. ✅ **Documentação completa** — 25 documentos entregues
2. 🔲 **Aprovação da visão e roadmapp** pelo time/cliente
3. 🔲 **Definição do nome final** e registro de domínio
4. 🔲 **Criação do design system** no Figma (cores, tipografia, componentes)
5. 🔲 **Setup do ambiente de desenvolvimento** (Docker, repositório, CI/CD)
6. 🔲 **Contratação de contador** para definição do CNPJ adequado
7. 🔲 **Registro na ANPD** para adequação LGPD

### Curto Prazo (Sprint 1-2)

8. 🔲 **Setup do monorepo** com Turborepo
9. 🔲 **Configuração do Docker + PostgreSQL + Redis**
10. 🔲 **Implementação do Prisma schema** e migrations iniciais
11. 🔲 **Setup do Next.js** com Tailwind + Shadcn
12. 🔲 **Setup do NestJS** com módulo de auth
13. 🔲 **CI/CD pipeline** (GitHub Actions → Vercel + Railway)

## Convite para Discussão

Este documento é um convite à colaboração. Nenhuma decisão aqui é definitiva — todas foram tomadas com base nas melhores informações disponíveis, mas podem e devem ser questionadas.

**Pontos que gostaria de discutir pessoalmente:**

1. O modelo freemium é agressivo o suficiente? Devemos ser ainda mais generosos no plano grátis?
2. MVP cortou muita coisa? O que está faltando no MVP que consideramos essencial?
3. Preços — R$ 49/mês é justo para a realidade dos terreiros brasileiros?
4. Qual a maior preocupação em relação ao projeto hoje?

## Checklist para Início do Desenvolvimento

```
☐ Nome final aprovado e domínio registrado
☐ Design System no Figma (telas chave)
☐ CNPJ definido e aberto
☐ Contador contratado
☐ Ambiente de desenvolvimento rodando (Docker)
☐ Repositório configurado com CI/CD
☐ Prisma schema finalizado e migrado
☐ Variáveis de ambiente definidas (.env.example → .env)
☐ Primeira task da Sprint 1 atribuída
☐ Métricas de sucesso definidas (OKRs)
```
