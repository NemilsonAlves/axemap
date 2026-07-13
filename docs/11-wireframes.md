# 11 — Wireframes (Descrição Estrutural)

## 1. Homepage (Visitante)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] AxéMap                    [Buscar...]    [Entrar] [°]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Hero Section                                          │      │
│  │  ┌────────────────────────────────────────────────┐    │      │
│  │  │  "Encontre o terreiro ideal para você"          │    │      │
│  │  │  [O que você busca?] [Onde?] [Buscar >]        │    │      │
│  │  │  [Usar minha localização]                       │    │      │
│  │  │  Banner: "Respeito. Axé. Conexão."             │    │      │
│  │  └────────────────────────────────────────────────┘    │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Categorias (scroll horizontal)                        │      │
│  │  [Umbanda] [Candomblé] [Jurema] [Tambor Mina] [...]   │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Terreiros em Destaque (grid 3 colunas)                │      │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                     │      │
│  │  │ Card 1 │ │ Card 2 │ │ Card 3 │                     │      │
│  │  │ Foto   │ │ Foto   │ │ Foto   │                     │      │
│  │  │ Nome   │ │ Nome   │ │ Nome   │                     │      │
│  │  │ Cidade │ │ Cidade │ │ Cidade │                     │      │
│  │  │ ★ 4.5  │ │ ★ 4.8  │ │ ★ 4.2  │                     │      │
│  │  └────────┘ └────────┘ └────────┘                     │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Mapa (Leaflet) — vista geral com pins                 │      │
│  │  ┌────────────────────────────────────────────────┐    │      │
│  │  │                    Mapa                         │    │      │
│  │  │        📍   📍                                  │    │      │
│  │  │              📍       📍                        │    │      │
│  │  │    📍                      📍                   │    │      │
│  │  └────────────────────────────────────────────────┘    │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  Footer                                                │      │
│  │  Sobre | Contato | LGPD | Termos | Ajuda               │      │
│  │  "AxéMap - Conectando pessoas à sua espiritualidade"   │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Página de Busca + Mapa

```
┌─────────────────────────────────────────────────────────────────┐
│ ← [Logo]                    [Buscar...]      [Filtros ▼] [User] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── Sidebar ───┬─────────────────── Mapa ───────────────────┐ │
│  │                │                                             │ │
│  │ Filtros        │     📍                                     │ │
│  │ ────────       │        📍        📍                        │ │
│  │ [Cidade ▼]     │                   📍                       │ │
│  │ [Estado ▼]     │              📍                            │ │
│  │ [Religião ▼]   │         📍                                 │ │
│  │ [Tradição ▼]   │                    📍                      │ │
│  │                │                                             │ │
│  │ □ Aceita       │                                             │ │
│  │   visitantes   │                                             │ │
│  │ □ Acessível    │                                             │ │
│  │ □ Inclusivo    │                                             │ │
│  │ □ Estacion.    │                                             │ │
│  │ □ Desenv.      │                                             │ │
│  │   mediúnico    │                                             │ │
│  │ □ Infantil     │                                             │ │
│  │ □ Banheiros    │                                             │ │
│  │                │                                             │ │
│  │ [Aplicar]      │                                             │ │
│  │ [Limpar]       │                                             │ │
│  └────────────────┴─────────────────────────────────────────────┘
│                                                                  │
│  Resultados (12 encontrados)                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ Templo       │ │ Terreiro     │ │ Centro       │              │
│  │ Pai João     │ │ Mãe Maria    │ │ São Jorge    │              │
│  │ Umbanda      │ │ Candomblé    │ │ Umbanda      │              │
│  │ Recife-PE    │ │ Salvador-BA  │ │ SP-SP        │              │
│  │ ★ 4.7 (23)   │ │ ★ 4.5 (15)   │ │ ★ 4.2 (8)    │              │
│  │ 🧑‍🤝‍🧑 Visit.  │ │ 🧑‍🤝‍🧑 Visit.  │ │ ______       │              │
│  │ ♿ Acessível  │ │ ______       │ │ ♿ Acessível  │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Perfil do Terreiro

```
┌─────────────────────────────────────────────────────────────────┐
│ ← [Logo]                                [User]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Cover Image (1920x400)                                 │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─ Foto Perfil (120x120) ─┐  Nome do Terreiro           ★ 4.7 │
│  │                         │  Tradição: Umbanda            (23)  │
│  │      [IMG]              │  Fundação: 1998                     │
│  │                         │  📍 Recife, PE — 3.2 km            │
│  └─────────────────────────┘                                     │
│                                                                  │
│  [Site] [WhatsApp] [Instagram] [Facebook] [YouTube]              │
│  [⭐ Favoritar] [↗ Compartilhar]                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Navegação Interna                                       │     │
│  │  [Sobre] [Fotos] [Vídeos] [Eventos] [Avaliações]        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─ Sobre ──────────────────────────────────────────────────┐    │
│  │                                                           │    │
│  │  Somos um terreiro de Umbanda fundado em 1998,            │    │
│  │  localizado no bairro da Boa Vista, Recife.               │    │
│  │  Acolhemos todos os filhos de fé, independente de          │    │
│  │  orientação, gênero ou condição social.                    │    │
│  │                                                           │    │
│  │  🧑‍🤝‍🧑 Aceita visitantes       ♿ Acessível                 │    │
│  │  🚗 Estacionamento          🚻 Banheiros                   │    │
│  │  🧒 Atendimento infantil     🔮 Desenvolv. mediúnico       │    │
│  │  🏳️‍🌈 Ambiente inclusivo       📝 Respeita nome social      │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Horários ───────────────────────────────────────────────┐    │
│  │  Seg-Sex: 14h-18h (atendimento)                          │    │
│  │  Sáb: 19h-23h (gira aberta ao público)                    │    │
│  │  Dom: 09h-12h (desenvolvimento mediúnico)                 │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Localização ─────────────────────────────────────────────┐    │
│  │  Rua Exemplo, 123 — Boa Vista — Recife/PE                 │    │
│  │  [Mini Mapa Leaflet]                                      │    │
│  │  [Como chegar → Google Maps]                              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Avaliações ─────────────────────────────────────────────┐    │
│  │  [Avaliar]                                                 │    │
│  │                                                           │    │
│  │  "Ambiente acolhedor" ★★★★★                               │    │
│  │  Carla S. — há 2 semanas                                  │    │
│  │  "Fui recebida com muito carinho. Recomendo."              │    │
│  │                                                           │    │
│  │  "Casa séria e respeitosa" ★★★★★                          │    │
│  │  João M. — há 1 mês                                       │    │
│  │  "Trabalho sério com os guias."                            │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Próximos Eventos ───────────────────────────────────────┐    │
│  │  [15/07] Gira de Preto Velho — 19h                        │    │
│  │  [22/07] Desenvolvimento Mediúnico — 09h                  │    │
│  │  [02/08] Festa de Iemanjá — 10h                           │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Dashboard do Dirigente (SaaS)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] AxéMap                        🔔 [3] 👤 [Pai Ricardo ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Sidebar ────┬────────────────── Content ───────────────────┐   │
│               │                                               │   │
│  📊 Dashboard │  Bom dia, Pai Ricardo!                       │   │
│  📋 Membros   │                                               │   │
│  📅 Agenda    │  ┌─ Resumo ──────────────────────────────┐   │   │
│  💰 Financeiro│  │ Membros: 32  │ Eventos: 5 próx.       │   │   │
│  📸 Galeria   │  │ Avaliações: │ Doações mês:            │   │   │
│  📝 Eventos   │  │ ⭐ 4.8 (12) │ R$ 2.450,00            │   │   │
│  📚 Cursos    │  └───────────────────────────────────────┘   │   │
│  ⚙️ Config    │                                               │   │
│  🔗 Subdomínio│  ┌─ Próximos Eventos ────────────────────┐   │   │
│  🆘 Ajuda     │  │ Hoje 19h — Gira de Preto Velho        │   │   │
│               │  │ [Confirmar presença] [Editar]         │   │   │
│  Seu plano:   │  │ Sáb 22/07 — Desenvolvimento           │   │   │
│  💎 Profission│  │ Dom 23/07 — Palestra "Ervas"          │   │   │
│  [Fazer upgr] │  └───────────────────────────────────────┘   │   │
│               │                                               │   │
│               │  ┌─ Atividade Recente ────────────────────┐   │   │
│               │  │ Novo membro: Lucas (ogã)              │   │   │
│               │  │ Nova avaliação: ★★★★★ "Casa séria"    │   │   │
│               │  │ Doação recebida: R$ 150,00 via Pix    │   │   │
│               │  └───────────────────────────────────────┘   │   │
│               └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Página de Busca — Mobile

```
┌─────────────────┐
│ [🔍] Buscar...  │
├─────────────────┤
│                  │
│ [Filtros ▼]      │
│                  │
│ ┌──────────────┐ │
│ │  Mapa        │ │
│ │  📍 📍      │ │
│ │     📍       │ │
│ │ 📍    📍    │ │
│ └──────────────┘ │
│                  │
│ Resultados       │
│ (scroll vertical)│
│ ┌──────────────┐ │
│ │ Terreiro X   │ │
│ │ ★ 4.5 — 2km │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ Terreiro Y   │ │
│ │ ★ 4.2 — 5km │ │
│ └──────────────┘ │
└─────────────────┘
```

## Princípios de Design

- **Layout:** Airbnb (cards de conteúdo) + Google Maps (busca + mapa lado a lado) + TripAdvisor (avaliações + fotos)
- **Cores:** Paleta neutra (tons de terra, branco, off-white) com acento em laranja/terracota
- **Tipografia:** Limpa e legível (Inter, Geist, ou similar)
- **Fotografia:** Imagens grandes e de alta qualidade — foco nos terreiros
- **Animações:** Suaves, mínimas, apenas para feedback funcional
- **Spacing:** Generoso, ar arejado (inspiração Notion/Airbnb)
