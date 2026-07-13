# 09 — Fluxos do Sistema

## Fluxo 1: Descoberta de Terreiro (MVP)

```
[Visitante] → [Homepage]
  → Busca por texto "terreiro em Recife"
    → [API Gateway] → [Busca Module]
      → PostgreSQL: SELECT com full-text search + filtro por cidade/estado
      → Redis: cache da busca (TTL 5min)
      → Retorna resultados
    → [Frontend] Renderiza:
      ┌────────────────────────────┐
      │  Mapa (Leaflet) com pins   │
      │  ┌────────┐  ┌─────────┐   │
      │  │ Lista  │  │  Mapa   │   │
      │  │ de     │  │  com    │   │
      │  │ Cards  │  │  Pins   │   │
      │  └────────┘  └─────────┘   │
      │  Filtros (sidebar)         │
      └────────────────────────────┘
  → Usuário aplica filtros:
    [Religião: Umbanda] [Aceita visitantes: Sim] [Acessibilidade: Sim]
  → [Frontend] Re-renderiza com novos resultados
  → Usuário clica em um card/perfil
  → [Frontend] Navega para /terreiro/[slug]
  → [API Gateway] → [Terreiro Module]
    → PostgreSQL: SELECT full terreiro + fotos + avaliações + horários + eventos
    → Retorna JSON
  → [Frontend] Renderiza perfil completo
```

## Fluxo 2: Cadastro de Terreiro

```
[Pai de Santo logado] → [Dashboard]
  → "Cadastrar novo terreiro"
  → Step 1: Informações Básicas
    [Nome, Tradição, Linha, Fundação]
  → Step 2: Localização
    [CEP → busca automática de endereço → geolocalização via Nominatim]
  → Step 3: Contato e Redes
    [WhatsApp, Instagram, Facebook, Site]
  → Step 4: Características
    [Checkboxes: aceita visitantes, acessibilidade, etc.]
  → Step 5: Fotos
    [Upload com preview → Cloudflare R2 → compressão automática]
  → Step 6: Horários
    [Dia da semana + abertura + fechamento + tipo]
  → Step 7: Revisão e Publicar
  → Submit → [API Gateway]
    → Validação (Zod)
    → [BullMQ] → email-queue: "Seu terreiro foi cadastrado com sucesso!"
    → [BullMQ] → notification-queue: notificar admins para moderação
    → Status: "pendente"
  → [Admin] → [Moderation Module]
    → Revisa informações
    → Aprova ou Rejeita
    → Notifica o dirigente
  → Status: "aprovado" → visível na busca
```

## Fluxo 3: Avaliação e Moderação

```
[Praticante logado] → [Perfil Terreiro]
  → "Avaliar"
  → Nota (1-5 stars) + Título + Comentário
  → Submit
  → [API Gateway] → [Avaliacao Module]
    → Valida (Zod): nota 1-5, texto mínimo 10 chars
    → Check: 1 avaliação por usuário por terreiro (UNIQUE constraint)
    → INSERT com status = 'pendente'
    → [BullMQ] → moderation-queue
  → [Admin/IA] → Moderação
    → Se IA: análise de sentimento + detecção de hate speech
    → Se humana: revisão manual
    → Status: 'aprovado' ou 'rejeitado'
    → Se aprovado: recalcula avaliacao_media no terreiro
    → Notifica usuário
  → Avaliação visível no perfil
```

## Fluxo 4: Compra no Marketplace (Futuro)

```
[Praticante] → [Marketplace]
  → Navega por categorias
  → [Velas] → encontra vela de 7 dias para Exu
  → Adiciona ao carrinho
  → + Ervas de defumação
  → Ver carrinho
  → Checkout
    → Endereço de entrega
    → Frete (cálculo via Correios API)
    → Pagamento: Pix (QR Code) ou Cartão (Stripe)
  → [Stripe/Pix] → Confirmação
  → [BullMQ] → order-queue
  → Vendedor recebe notificação
  → Vendedor prepara e envia
  → Código de rastreio
  → Comprador recebe notificação de envio
  → Após entrega: avaliar produto
```

## Fluxo 5: Monetização SaaS (Futuro)

```
[Terreiro] → [Painel] → "Planos"
  → Plano atual: Gratuito
  → Ver upgrade: "Básico" (R$ 49/mês)
    → Vantagens: agenda, 10 membros, financeiro
  → Upgrade para "Profissional" (R$ 99/mês)
    → Vantagens: membros ilimitados, subdomínio, cursos
  → Clica "Assinar Profissional"
  → [Stripe Checkout] → pagamento (cartão/Pix)
  → Webhook Stripe → [API Gateway]
    → Atualiza plano no terreiro
    → Libera módulos
    → Notifica dirigente
  → [BullMQ] → audit-queue: log da alteração
```

## Fluxo 6: Busca com Geolocalização

```
[Visitante] → [Homepage]
  → "Usar minha localização" (permissão do navegador)
  → [Frontend] navigator.geolocation.getCurrentPosition()
  → Envia lat/lng para API
  → [Busca Module]
    → PostgreSQL: ORDER BY geo_point <-> ST_MakePoint($lng, $lat) LIMIT 20
    → Haversine filter para raio (padrão 50km)
    → Aplica filtros adicionais
    → Cache no Redis com TTL 10min (chave: geo:{lat}:{lng}:{radius})
  → Retorna terreiros ordenados por distância
  → [Frontend] Renderiza
    → Mapa centralizado na localização do usuário
    → Cards ordenados por distância
    → "À 2.3 km" | "À 15.7 km"
```

## Fluxo 7: Login e Autenticação

```
[Usuário] → [Login]
  → Email + Senha
    → [Auth Module]
      → Verifica se usuário existe
      → Verifica se não está bloqueado (login_attempts < 5)
      → bcrypt.compare(password_hash)
      → Se erro: incrementa login_attempts
      → Se 5+ tentativas: locked_until = now() + 15min
      → Se sucesso: reseta login_attempts
      → Gera access_token (JWT, 15min) + refresh_token (JWT, 7d)
      → Retorna tokens + user profile
  → Opção: Google OAuth
    → [OAuth2] → Google → Callback
    → Se email existe: vincula conta Google
    → Se não: cria usuário
  → [Frontend] Armazena tokens (httpOnly cookie + memory)
  → Redireciona para dashboard ou página anterior
```
