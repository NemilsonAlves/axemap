# AxéMap ADS — Publicidade

## Princípio

O AxéMap ADS é uma fonte legítima de receita comercial.

**REGRA ABSOLUTA:**
Pagamento publicitário **NUNCA** altera:
- Trust Score
- Verificação / Certificação
- Avaliações
- Denúncias
- Reputação
- Posição orgânica no mapa

Publicidade altera **SOMENTE** exposição publicitária claramente identificada.

---

## Identificação Obrigatória

Todo anúncio publicado **deve** exibir um dos seguintes rótulos:
- `PATROCINADO`
- `PUBLICIDADE`

O campo `rotulo` é sempre incluído na resposta da API `/ads/publicados`.

---

## Tipos de Anúncio (Placements)

| Placement | Descrição |
|---|---|
| `BANNER_HOME` | Banner na página inicial |
| `BANNER_MAPA` | Banner na página do mapa |
| `CARD_PATROCINADO` | Card claramente marcado nos listados |
| `EVENTO_PATROCINADO` | Evento patrocinado (rotulado) |
| `ORGANIZACAO_PATROCINADORA` | Organização patrocinadora (rotulada) |
| `CONTEUDO_PATROCINADO` | Conteúdo patrocinado (rotulado) |
| `PAGINA_INSTITUCIONAL` | Página institucional patrocinada |
| `MIDIA_REGIONAL` | Mídia segmentada por região |
| `MIDIA_NACIONAL` | Mídia nacional |
| `MIDIA_INTERNACIONAL` | Mídia internacional |

---

## Fluxo de Anúncio

```
ANUNCIANTE CRIA PEDIDO
↓ POST /ads/pedidos
↓ status: AGUARDANDO_PAGAMENTO
↓
PAGAMENTO REALIZADO
↓ Webhook confirma
↓ status: EM_REVISAO
↓
MODERAÇÃO ADMIN
↓ POST /admin/ads/campanhas/:id/aprovar
↓ status: APROVADO
↓
PUBLICAÇÃO
↓ POST /admin/ads/campanhas/:id/publicar
↓ status: PUBLICADO
↓
ENCERRAMENTO AUTOMÁTICO (dataFim atingida)
↓ status: ENCERRADO
```

---

## APIs

### Público / Frontend

| Endpoint | Método | Auth | Descrição |
|---|---|---|---|
| `/ads/publicados` | GET | Pública | Anúncios ativos para renderização (inclui `rotulo: "PATROCINADO"`) |
| `/ads/pedidos` | POST | JWT | Criar pedido de anúncio |
| `/ads/pedidos/meus` | GET | JWT | Meus pedidos |
| `/ads/pedidos/:id` | GET | JWT | Detalhe do pedido |
| `/ads/:id/impressao` | POST | Pública | Registrar impressão |
| `/ads/:id/clique` | POST | Pública | Registrar clique |

### Administração

| Endpoint | Método | Auth | Descrição |
|---|---|---|---|
| `/admin/ads/campanhas` | GET | ADMIN | Lista todas |
| `/admin/ads/campanhas/:id` | GET | ADMIN | Detalhe |
| `/admin/ads/campanhas/:id/aprovar` | POST | ADMIN | Aprovar |
| `/admin/ads/campanhas/:id/publicar` | POST | ADMIN | Publicar |
| `/admin/ads/campanhas/:id/pausar` | POST | ADMIN | Pausar |
| `/admin/ads/campanhas/:id/rejeitar` | POST | ADMIN | Rejeitar (com motivo) |
| `/admin/ads/campanhas/:id/bloquear` | POST | ADMIN | Bloquear |

---

## Modelos Prisma

- `AdCampanha` — campanha publicitária
- `AdPagamento` — pagamento associado

**Campos relevantes:**
- `status` — ciclo de vida (RASCUNHO → PUBLICADO → ENCERRADO)
- `impressoes` / `cliques` — métricas
- `placement` / `category` — segmentação
- `motivoRejeicao` — quando rejeitado
- `revisadoPorId` — audit de moderação

---

## Segmentação Disponível

- `cidadeAlvo`: cidade específica
- `estadoAlvo`: estado (UF)
- `placement`: tipo de posicionamento
- `category`: categoria do anúncio

---

## Status de Implementação

| Componente | Status |
|---|---|
| Modelos Prisma (AdCampanha, AdPagamento) | ✅ |
| Migration SQL | ✅ |
| AdsService (CRUD + moderação) | ✅ |
| AdsController (/ads/...) | ✅ |
| AdsAdminController (/admin/ads/...) | ✅ |
| Testes separação Trust/ADS | ✅ ads-trust-separation.spec.ts |
| Integração com gateway de pagamento | ⏳ Aguarda gateway real |
| Dashboard de ADS no admin | ⏳ Frontend pendente |
| Impressões/cliques em tempo real | ⏳ Redis/queue pendente |
