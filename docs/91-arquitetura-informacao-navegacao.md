# 91 — Arquitetura de Informação e Navegação

## Escopo e Relação com Outros Documentos

Este documento detalha as **Etapas 05, 06 e 07** do projeto (Arquitetura de Informação, Módulos e Navegação). Ele complementa — e não duplica — os seguintes documentos:

| Documento | O que já cobre | O que este documento adiciona |
|-----------|----------------|-------------------------------|
| 05 — Arquitetura do Sistema | Módulos backend, cache, filas, segurança | Organização da informação e navegação para o usuário |
| 08 — Casos de Uso | Atores e casos de uso (UC01–UC18) | Estrutura das telas, rotas e hierarquia de informação |
| 09 — Fluxos do Sistema | Fluxos técnicos de busca, terreiros e auth | Mapas de navegação e regras de URL |
| 11 — Wireframes | Descrição estrutural das telas | Cabeçalho, mega menu, breadcrumbs e breakpoints |
| 12 — Estrutura de Pastas | Rotas do App Router no frontend | Convenções de nomenclatura de URL e SEO |
| 13 — APIs | Endpoints REST/GraphQL | Como cada tela consome os módulos da API |
| 53 — Trust Score | Arquitetura do módulo | Posição do Trust Score na navegação e transparência |
| 57 — Permissões e Papéis (RBAC) | Matriz de permissões | O que cada papel vê na navegação |
| 68 — Busca Semântica | Evolução da busca em 3 fases | Integração da busca semântica com o search global |

---

## 1. Princípios de Arquitetura de Informação

Os princípios abaixo guiam toda decisão de organização de conteúdo, rótulos e navegação do AxéMap.

### 1.1 Poucos cliques

- **Regra do clique 3:** qualquer conteúdo relevante deve ser alcançável em no máximo 3 cliques a partir da Home (Home → Lista → Detalhe).
- O fluxo primário de descoberta nunca exige login: **buscar, ver perfil e entrar em contato** funcionam para visitantes.
- **Nenhum clique quebrado:** todo rótulo visível é clicável e leva a uma página útil (nunca a modais vazios).

### 1.2 Descoberta natural

- O usuário chega ao AxéMap com intenção concreta ("encontrar um terreiro perto de casa"). A busca, o mapa e as categorias por tradição são a espinha dorsal da descoberta.
- **Sugestão progressiva:** a navegação sugere o próximo passo natural (do perfil do terreiro para "Próximos eventos" e "Como chegar"), em vez de deixar o usuário perdido.
- **Efeito vitrine:** terreiros verificados, eventos em destaque e conteúdo da Biblioteca devem aparecer sem o usuário pedir — descoberta serendipitosa para curiosos e turistas.

### 1.3 Hierarquia clara

- Máximo de **3 níveis de profundidade** em cada área (ex.: Marketplace → Categoria → Produto).
- A hierarquia segue a frequência de uso, não a estrutura organizacional interna da plataforma. O que mais se usa fica mais alto.
- Áreas de gestão (Dashboard SaaS) ficam **separadas** da navegação pública — nunca misturadas no mesmo menu.

### 1.4 Linguagem do usuário

Rótulos e mensagens usam o vocabulário da comunidade, não jargão técnico ou corporativo. Onde o termo nativo for o mais claro, ele é o rótulo; o termo formal aparece como complemento.

| Termo nativo | Significado | Onde é usado na UI |
|--------------|-------------|--------------------|
| **Casa** | Terreiro, a comunidade de fé | "Conheça esta casa", "A casa realiza giras abertas" |
| **Axé** | Energia vital, força da tradição | Marca e mensagens de sucesso ("Seu axé foi enviado") |
| **Frequentar** | Participar regularmente das atividades | Cardápio do perfil: "Quero frequentar" |
| **Gira** | Sessão/ritual da Umbanda | Filtros de evento: "Gira aberta", "Gira de Caboclo" |
| **Toque** | Ritual do Candomblé com atabaques | Filtro de evento: "Toque de Oxóssi", "Festa de toque" |
| **Roça** | Casa de Candomblé (liturgia) | Auto-descrição da tradição no cadastro do terreiro |
| **Pai/Mãe de Santo** | Dirigente espiritual | Perfil do terreiro e painel de gestão |
| **Filho de Santo** | Membro iniciado | Papel de membro no painel |
| **Santo** / **Orixá** | Divindade | Filtros e descrições de eventos |
| **Oferenda** | Oferta ritual | Categoria do Marketplace |

Regras de uso do vocabulário:

1. **Rótulos de primeiro nível** (menus, botões) usam termos amplos e claros: "Terreiros", "Eventos", "Avaliações".
2. **Vocabulário nativo** entra em segundo nível e no conteúdo: filtros, descrições, mensagens de sucesso.
3. **Neutralidade religiosa:** nunca forçar terminologia de uma tradição sobre outra (ver doc 01). "Gira" e "Toque" coexistem como filtros independentes.
4. Glossário de termos, com links para a Biblioteca, é exibido em perfis e eventos para visitantes que desconhecem o vocabulário.

---

## 2. Mapa do Site (Árvore Completa)

Estrutura hierárquica de todas as áreas da plataforma, agrupada por audiência. Níveis indentados indicam sub-navegação.

```
axemap.com.br
│
├── [PÚBLICO — Visitante (não logado)]
│   ├── /                        Home
│   │   ├── Hero de busca (texto + localização)
│   │   ├── Categorias por tradição (Umbanda, Candomblé, Jurema...)
│   │   ├── Terreiros em destaque (por Trust Score e região)
│   │   ├── Mapa geral com pins
│   │   └── Conteúdo da Biblioteca em evidência
│   ├── /busca                  Busca geral (texto + filtros + resultados)
│   ├── /mapa                   Mapa interativo em tela cheia
│   ├── /terreiros              Diretório de terreiros (lista + filtros)
│   │   └── /terreiros/[slug]   Perfil público do terreiro
│   │       ├── Sobre
│   │       ├── Fotos e vídeos
│   │       ├── Horários
│   │       ├── Eventos do terreiro
│   │       ├── Avaliações
│   │       └── Trust Score (selo + detalhes transparentes)
│   ├── /eventos                Agenda geral de eventos
│   │   └── /eventos/[slug]     Detalhe do evento
│   ├── /cursos                 Catálogo de cursos
│   │   └── /cursos/[slug]      Detalhe do curso (público + matrícula)
│   ├── /marketplace            Marketplace de artigos religiosos
│   │   ├── /marketplace/categorias/[slug]    Lista por categoria
│   │   └── /marketplace/produtos/[slug]      Página do produto
│   ├── /comunidade             Feed comunitário (posts, fotos, relatos)
│   ├── /biblioteca             Biblioteca de conteúdo (artigos, mitos, orixás, guia de termos)
│   ├── /turismo                Turismo religioso (rotas, circuitos, cidades)
│   ├── /chat-ia                Assistente IA (primeiro contato e perguntas frequentes)
│   ├── /sobre · /contato · /ajuda · /privacidade · /termos
│   ├── /transparencia          Central de Transparência
│   │   ├── /transparencia/trust-score     Como o Trust Score é calculado
│   │   ├── /transparencia/governanca      Estrutura de governança da plataforma
│   │   └── /transparencia/mediacao        Política e processo de mediação de conflitos
│   └── /auth
│       ├── /auth/login         Login (email + social)
│       ├── /auth/cadastro      Cadastro (email + social)
│       └── /auth/recuperar     Recuperação de senha
│
├── [ÁREA LOGADA — Praticante]
│   ├── /perfil                 Meu perfil público
│   ├── /minhas-avaliacoes      Avaliações que publiquei (estado de moderação)
│   ├── /meus-favoritos         Terreiros, eventos e produtos salvos
│   ├── /meu-historico          Histórico de buscas, visitas e compras
│   ├── /minhas-compras         Pedidos do Marketplace (comprador)
│   ├── /minhas-matriculas      Cursos matriculados
│   ├── /minhas-denuncias       Acompanhamento de denúncias enviadas
│   ├── /notificacoes           Central de notificações
│   ├── /configuracoes          Conta, senha, privacidade, LGPD (consentimentos)
│   └── /conversas              Conversas (chat com terreiros / suporte)
│
├── [GESTÃO — Dirigente e equipe do terreiro]
│   ├── /dashboard              Visão geral do terreiro
│   ├── /dashboard/membros      Gestão de membros (filhos de santo, ogãs, ekedis)
│   ├── /dashboard/agenda       Agenda de atividades e giras
│   ├── /dashboard/eventos      Publicação e gestão de eventos
│   ├── /dashboard/cursos       Publicação e gestão de cursos
│   ├── /dashboard/avaliacoes   Avaliações recebidas + direito de resposta
│   ├── /dashboard/financeiro   Financeiro e doações (SaaS)
│   ├── /dashboard/galeria      Fotos e vídeos do terreiro
│   ├── /dashboard/verificacao  Solicitação e acompanhamento de verificação
│   ├── /dashboard/vendas       Vendas do Marketplace (vendedor)
│   ├── /dashboard/trust-score  Painel do Trust Score + dicas de melhoria
│   ├── /dashboard/configuracoes  Perfil, visibilidade, plano e integrações
│   └── /dashboard/mediacoes    Acompanhamento de mediações do terreiro
│
├── [ADMINISTRAÇÃO — Staff AxéMap]
│   ├── /admin                  Dashboard administrativo
│   ├── /admin/moderacao        Fila de moderação (terreiros, avaliações, conteúdo)
│   ├── /admin/verificacao      Aprovação documental (verificadores)
│   ├── /admin/denuncias        Fila de denúncias
│   ├── /admin/mediacao         Casos de mediação de conflito
│   ├── /admin/usuarios         Gestão de usuários e suspensões
│   ├── /admin/terreiros        Gestão de terreiros e selos
│   ├── /admin/relatorios       Relatórios gerenciais (Super Admin)
│   └── /admin/logs             Auditoria (Super Admin)
│
└── [DESENVOLVEDORES]
    └── /dev                    Portal de desenvolvedores
        ├── /dev/api            Documentação REST + GraphQL
        ├── /dev/keys           Chaves de API pública
        └── /dev/status         Status dos serviços
```

### 2.1 Notas sobre o mapa

- **Perfis:** o perfil de **terreiro** (entidade institucional) e o perfil de **pessoa** (praticante/dirigente) são objetos distintos. O perfil de pessoa só é público se o usuário optar por "perfil público"; o de terreiro é público por natureza.
- **A Central de Transparência, Governança, Mediação e Trust Score** são acessíveis pelo rodapé global (além de links contextuais), pois atendem à promessa de transparência do produto (doc 01, doc 48).
- **Turismo** é uma área de descoberta que reutiliza o motor de terreiros/eventos com um recorte próprio (rotas, cidades, roteiros), sem duplicar modelagem de dados.

---

## 3. Relações e Dependências entre Módulos

Módulo = unidade de produto/navegação. A tabela abaixo descreve de onde cada módulo tira dados e quem o consome.

| Módulo | Depende de (módulos/APIs) | Usado por |
|--------|---------------------------|-----------|
| **Home** | Busca, Terreiros, Eventos, Biblioteca, Trust Score | Visitante, Praticante |
| **Mapa** | Busca geográfica (doc 86), Terreiros, Busca semântica | Visitante, Praticante |
| **Busca** | Módulo de busca (doc 68), Terreiros, Eventos, Cursos, Marketplace, Trust Score (ranking) | Todos |
| **Terreiros** | Auth (cadastro), Verificação, Trust Score, Avaliações, Eventos, Fotos, Mediação | Todos |
| **Perfis** | Auth, Terreiros, Avaliações, Favoritos, RBAC (doc 57) | Praticante, Dirigente |
| **Eventos** | Terreiros (owner), Auth, Notificações, Pagamentos (ingressos, futuro) | Visitante, Praticante, Dirigente |
| **Cursos** | Terreiros (instrutor), Pagamentos, Matrículas | Praticante, Dirigente |
| **Marketplace** | Produtos, Pedidos, Pagamentos, Terreiros (vendedor), Avaliações de produto | Praticante, Dirigente/vendedor |
| **Comunidade** | Auth, RBAC (moderação), Mediação, Denúncias | Praticante |
| **Biblioteca** | Conteúdo editorial, Ontologia do domínio (doc 66) | Todos |
| **Turismo** | Busca geográfica, Terreiros, Eventos, Conteúdo editorial | Visitante |
| **Chat IA** | Busca semântica, Biblioteca, Knowledge Graph (doc 65), Moderação IA (doc 69) | Visitante, Praticante |
| **Dashboard (SaaS)** | Terreiros, Membros, Agenda, Financeiro, Planos, Trust Score, Vendas | Dirigente e equipe |
| **Administração** | Todos os módulos (fila de moderação, relatórios), Auditoria (doc 61) | Staff AxéMap |
| **API/Desenvolvedores** | API pública (doc 13), Analytics | Pesquisadores, Governo, ONGs |
| **Notificações** | Eventos de domínio (doc 42), WebSocket (doc 13), Email/WhatsApp | Todos os logados |
| **Perfil (usuário)** | Auth, Favoritos, Histórico, Compras, Matrículas | Praticante |
| **Configurações** | Auth, LGPD, Planos, Notificações | Todos os logados |
| **Ajuda** | Suporte (tickets), Biblioteca, Chat IA | Todos |
| **Central de Transparência** | Trust Score, Governança (doc 48), Mediação | Todos |
| **Governança** | Administração, Mediação, Auditoria | Staff, comunidade |
| **Mediação** | Denúncias, Avaliações, Terreiros, Comunidade, Notificações | Staff, Dirigentes, Praticantes |
| **Trust Score** | Avaliações, Verificação, Terreiros, Eventos, Ações sociais (doc 53) | Todos (exibição) + Dirigente (painel) |

### 3.1 Regras de dependência

1. **Núcleo mínimo do MVP:** Auth → Terreiros → Busca → Avaliações → Trust Score. Nenhum módulo do MVP depende de módulos futuros (Marketplace, Cursos, Comunidade, Turismo).
2. **Módulos de apoio transacional** (Pagamentos, Pedidos, Matrículas) dependem do módulo de Auth e de um agente identidade (usuário ou terreiro) — nunca entre si, para evitar acoplamento.
3. **Moderação é transversal:** qualquer conteúdo criado por usuário (avaliação, evento, post, produto, denúncia) passa pela mesma fila de moderação e pelo mesmo estado "pendente → aprovado/rejeitado".
4. **Notificações nunca bloqueiam:** todos os módulos emitem eventos de domínio; as notificações consomem eventos de forma assíncrona (doc 05 — filas BullMQ).

---

## 4. Estrutura de Navegação por Breakpoint

### 4.1 Desktop (>= 1024px)

- **Cabeçalho fixo** com as 4 zonas (seção 6): logo, nav global com MegaMenu, busca global, ações de conta.
- **Sidebar contextual:** em áreas de trabalho (Dashboard, Administração) a navegação primária passa para a sidebar esquerda; o cabeçalho permanece com logo, busca e conta.
- **Perfil público do terreiro:** navegação interna em abas (Sobre / Fotos / Eventos / Avaliações / Trust Score), conforme wireframe do doc 11.
- Atalho global **⌘K** (Cmd+K / Ctrl+K) abre a busca inteligente em modal.

### 4.2 Tablet (768px – 1023px)

- **Cabeçalho reduzido:** logo, busca (ícone), ações de conta. O MegaMenu é substituído por um **menu hambúrguer com drawer** (painel deslizante).
- **Busca + Mapa:** o modo "busca com mapa" alterna lista e mapa por abas (nunca lado a lado), preservando a sidebar de filtros como painel recolhível.
- **Sidebar contextual** do Dashboard permanece, mas com itens de primeiro nível apenas.

### 4.3 Mobile (< 768px)

- **Tab bar inferior fixa** com 5 destinos primários: **Início · Buscar · Mapa · Favoritos · Perfil** (dependendo do estado de login; para visitantes, o 5º item é "Entrar").
- **Drawer de navegação** (menu hambúrguer) contém todo o restante: Categorias, Eventos, Cursos, Marketplace, Comunidade, Biblioteca, Turismo, Chat IA, Ajuda, Configurações.
- **Busca global** no topo: campo expandido ao focar; sugestões abaixo do campo.
- Gestos: swipe para voltar, pull-to-refresh em listas e feed. Filtros abrem em bottom sheet.

### 4.4 PWA e App Mobile

- **Mesma árvore de informação** do web; a PWA adiciona a camada de **instalação** (manifest + service worker, doc 05) e **notificações push** para eventos, avaliações e mensagens.
- **App nativo** (React Native, futuro, doc 19) mantém a tab bar e adiciona:
  - Busca com voz (evolução da busca semântica, doc 68);
  - Geofencing para alertas de eventos próximos;
  - Câmera direta para envio de fotos e documentos de verificação (evita o upload manual pesado).

### 4.5 Busca global, busca inteligente e busca semântica

| Componente | Onde aparece | Comportamento |
|------------|--------------|---------------|
| **Campo de busca global** | Cabeçalho (todas as telas, desktop); topo (mobile) | Foca em autocomplete: terreiros, cidades, tradições, entidades, produtos |
| **Busca inteligente (⌘K)** | Modal global | Busca unificada (terreiros + eventos + cursos + produtos + conteúdo da Biblioteca + atalhos de navegação) com teclado full-ARIA |
| **Busca semântica** | Campo de busca e Chat IA | Entende intenção em linguagem natural ("terreiro acolhedor LGBTQIA+ perto de casa"), conforme Fases 2 e 3 do doc 68; na Fase 1 (MVP) cai para full-text + filtros |
| **Sugestões recentes** | Dropdown da busca | Combina histórico do usuário (se logado) + buscas populares (Redis, doc 68) |

### 4.6 Atalhos, favoritos e histórico

| Recurso | Localização | Regra |
|---------|-------------|-------|
| **⌘K** | Global | Abre busca inteligente em qualquer tela |
| **⌘B** | Global | Alterna sidebar contextual (Dashboard/Admin) |
| **⌘/** | Global | Abre paleta de atalhos (documentação em tela) |
| **Favoritos** | Ícone de coração no card/perfil + tab "Favoritos" | Persistido por usuário; agrupável em listas (ex.: "Candidatos para frequentar", "Comprar depois") |
| **Histórico** | /meu-historico | Buscas, terreiros visitados, eventos vistos, pedidos; permite limpar por item (LGPD) |

---

## 5. Especificação do Cabeçalho (4 Zonas)

```
┌───────────┬──────────────────────────────────────┬────────────────────┬──────────────────┐
│  Zona 1   │             Zona 2                    │      Zona 3        │     Zona 4       │
│   Logo    │  Navegação global (MegaMenu)          │  Busca global      │  Ações de conta  │
│           │  [Terreiros ▾] [Eventos] [Cursos]     │  [⌘K Buscar... 🔍] │  [Entrar] [Criar  │
│           │  [Marketplace ▾] [Comunidade]         │                    │   conta]         │
└───────────┴──────────────────────────────────────┴────────────────────┴──────────────────┘
```

**Zona 1 — Logo:** link para a Home. Em telas internas de trabalho (Dashboard/Admin), exibe breadcrumb ou título da seção ao lado.

**Zona 2 — Navegação global com MegaMenu.** Itens com submenus recebem indicador visual de expansão. Exemplo do MegaMenu de **Terreiros**:

```
Terreiros ▾
├── Descobrir
│   ├── Buscar terreiros
│   ├── Mapa
│   └── Terreiros verificados
├── Por tradição
│   ├── Umbanda
│   ├── Candomblé
│   ├── Jurema
│   ├── Tambor de Mina
│   └── Outras tradições
└── Ações
    ├── Cadastrar meu terreiro   (logado + papel dirigente)
    └── Reivindicar perfil       (logado)
```

Exemplo do MegaMenu de **Marketplace**:

```
Marketplace ▾
├── Categorias
│   ├── Velas e defumações
│   ├── Ervas e banhos
│   ├── Roupas e fios de conta
│   ├── Ferramentas rituais
│   └── Oferendas e artigos de altar
├── Para a casa
│   ├── Atabaques e instrumentos
│   └── Esculturas e imagens
└── Ações
    ├── Minhas compras        (logado)
    └── Abrir loja            (logado + papel vendedor)
```

Regras do MegaMenu:

1. Máximo de **3 colunas**; a primeira coluna contém os links de maior frequência.
2. O MegaMenu fecha ao clicar fora, pressionar `Esc` ou navegar.
3. Apenas itens com submenu usam MegaMenu; o restante da Zona 2 usa links diretos (Eventos, Cursos, Comunidade).

**Zona 3 — Busca global:** campo com placeholder em linguagem natural ("O que você procura?"), atalho ⌘K, autocomplete e sugestões.

**Zona 4 — Ações de conta:**

| Estado | Conteúdo |
|--------|----------|
| **Visitante** | "Entrar" (link) + "Criar conta" (botão primário) |
| **Praticante logado** | Ícone de notificações (com badge de pendências), avatar/menu de conta (Perfil, Favoritos, Configurações, Sair) |
| **Dirigente logado** | Igual ao praticante + botão "Painel do terreiro" (atalho para /dashboard) |
| **Staff** | Igual acima + atalho "/admin" e badge de fila de moderação |

---

## 6. Breadcrumb

### 6.1 Padrão

```
Início / Terreiros / Umbanda / [Nome do Terreiro]
```

- Sempre a partir de **Início** (nunca da marca sozinha).
- O item atual é o último, em negrito e sem link.
- Separação com "/" e títulos em minúscula (exceto nomes próprios).

### 6.2 Quando usar

- **Páginas aninhadas com hierarquia real:** perfil de terreiro, detalhe de evento, produto de marketplace, conteúdo da biblioteca, páginas de admin.
- **Áreas profundas de gestão:** dashboard → membros → [membro].

### 6.3 Quando omitir

- **Home** (não tem breadcrumb).
- **Páginas de fluxo** (login, cadastro, checkout, onboarding) — o usuário está em um fluxo linear; breadcrumb polui e sugere retorno indevido.
- **Busca e mapa** (a página é raiz de contexto).
- **Mobile** em áreas de primeiro nível (tab bar já dá contexto); mantém-se apenas em páginas de detalhe.

### 6.4 Regra de negócio

- Ao navegar por breadcrumb, o usuário retorna **mantendo os filtros** da sessão de busca (ex.: voltar de um terreiro para a lista com filtros aplicados).

---

## 7. Regras de Nomenclatura de Rotas (URLs)

### 7.1 Convenções

| Regra | Exemplo correto | Exemplo errado |
|-------|-----------------|----------------|
| Português do Brasil, kebab-case | /terreiros/pai-joao | /terreiros/pai_joao |
| Substituição de acentos | /cursos/candomble-iniciacao | /cursos/candomblé |
| Recursos no plural para listas | /terreiros, /eventos, /cursos | /terreiro, /evento |
| Singular para entidades específicas | /terreiros/[slug] | /terreiro/123 |
| Slugs legíveis, não UUIDs | /marketplace/produtos/vela-7-dias | /marketplace/produtos/8f3c... |
| Identificadores numéricos apenas quando não há slug | /eventos/[slug] | /eventos/42 |
| Hierarquia real com "/" apenas quando semanticamente necessária | /marketplace/categorias/ervas | /marketplace/ervas-e-banhos |

### 7.2 Regras de slug

1. **Terreiros:** gerados a partir do nome (doc 59 — anti-duplicidade), com sufixo de cidade/UF em caso de colisão: `terreiro-pai-joao`, `terreiro-pai-joao-recife`.
2. **Eventos:** `gira-de-preto-velho` + data quando necessário: `gira-de-preto-velho-2026-08`.
3. **Produtos:** `vela-7-dias-vermelha` — slug estável mesmo com mudança de preço.
4. **Pessoas:** perfil público apenas com consentimento; slug `usuario-[handle]` com handle escolhido pelo usuário.
5. Slugs são **imutáveis** após publicação; mudanças exigem redirect 301 permanente.

### 7.3 SEO (complementa doc 33)

| Prática | Implementação |
|---------|---------------|
| Sitemap dinâmico | sitemap.xml gerado via ISR para terreiros, eventos, produtos e biblioteca |
| Canonical | Sempre presente; páginas com filtros em busca são `noindex,follow` |
| Open Graph | Terreiros, eventos e produtos com OG image rica (doc 08 — UC06) |
| Structured data | Schema.org `LocalBusiness`/`CivicStructure` para terreiros; `Event` para eventos; `Product` para produtos |
| Breadcrumb JSON-LD | Alinhado com o breadcrumb visual |
| Links permanentes | Padrão `https://axemap.com.br/<caminho>` sem parâmetros de rastreio públicos |

---

## 8. Mapa de Navegação por Perfil (logado vs. não logado)

Referência de autorização: doc 57 (RBAC). A navegação respeita a matriz de permissões; um item só é exibido se o papel tiver permissão, e o backend revalida em toda requisição.

| Área | Visitante | Praticante | Dirigente/Equipe | Staff |
|------|-----------|------------|------------------|-------|
| Home, Busca, Mapa, Terreiros, Eventos | Visível | Visível | Visível | Visível |
| Marketplace (comprar) | Visível (compra exige login) | Visível | Visível | Visível |
| Biblioteca, Turismo, Chat IA | Visível | Visível | Visível | Visível |
| Comunidade | Leitura | Leitura + postar/comentar | Leitura + postar | Modera |
| Perfil do terreiro | Leitura | Leitura + favoritar + avaliar + compartilhar | Leitura + gerenciar | Modera |
| Perfil pessoal público | — | Se consentir | Se consentir | Visível p/ suporte |
| Favoritos, Histórico, Compras, Matrículas | — | Visível | Visível | — |
| Notificações | — | Visível | Visível | Visível |
| Configurações | — | Visível | Visível | Visível |
| Dashboard (SaaS) | — | — | Visível (papel no terreiro) | — |
| Solicitar verificação | — | — | Dirigente/Co-Admin | Verificador aprova |
| Marketplace — vendas | — | — | Vendedor aprovado | Modera produtos |
| Administração | — | — | — | Staff (por papel) |
| Central de Transparência | Visível | Visível | Visível | Visível |
| API/Desenvolvedores | Visível (docs) | — | — | — |

### 8.1 Regras de redirecionamento

1. **Fluxos exigem login** (avaliar, favoritar, comprar, matricular, postar): o sistema redireciona para `/auth/login?next=<url>` e retorna à página original após autenticação (preservando estado, ex.: carrinho).
2. **Ações de dirigente** (cadastrar terreiro, publicar evento, verificar): exigem papel dirigente/Co-Admin; visitante logado sem papel vê CTA "Cadastrar meu terreiro" com explicativo.
3. **Áreas de staff:** qualquer acesso sem papel staff retorna 404 (não 403) para não expor a existência da área.
4. **Navegação pública nunca quebra sem login:** todas as rotas públicas do mapa (seção 2) funcionam para visitantes; exigir login é exceção, não regra.

### 8.2 Comportamento de "próximo passo" por papel

| Papel | Próximo passo natural após o login |
|-------|-------------------------------------|
| Visitante → Praticante | Onboarding de primeiro acesso (doc 92 — Fluxo 5) |
| Praticante | Sugestões de terreiros por perfil + eventos próximos |
| Dirigente sem terreiro | CTA "Cadastrar meu terreiro" |
| Dirigente com terreiro pendente | Acompanhamento de moderação no dashboard |
| Dirigente com terreiro aprovado | Painel do terreiro + dicas de Trust Score |

---

## 9. Resumo de Decisões de IA

| # | Decisão | Justificativa |
|---|---------|---------------|
| IA-01 | Busca/mapa como espinha dorsal pública | Intenção primária de descoberta; exige zero login |
| IA-02 | Vocabulário nativo em rótulos de segundo nível | Falar a língua do usuário sem abrir mão da neutralidade |
| IA-03 | Navegação de gestão separada da pública | Evita sobrecarga cognitiva; papéis distintos (doc 57) |
| IA-04 | Máximo 3 cliques para qualquer conteúdo relevante | Redução de atrito e melhora de conversão |
| IA-05 | Transparência (Trust Score, Governança, Mediação) no rodapé global | Pilares de confiança sempre acessíveis |
| IA-06 | Slugs em pt-BR, imutáveis, com redirects | SEO estável e URLs memoráveis |
| IA-07 | Breadcrumb omitido em fluxos lineares | Não induz abandono de checkout/cadastro |
| IA-08 | Tab bar mobile com 5 destinos + drawer | Mobile-first com navegação de alta frequência |
