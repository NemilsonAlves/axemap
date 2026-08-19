# AxéMap — Círculo de Apoiadores

## O Conceito

O Círculo de Apoiadores é o programa de sustentação voluntária do AxéMap.
Ele permite que pessoas que acreditam na missão da plataforma contribuam
financeiramente para manter servidores, segurança, desenvolvimento, pesquisa,
conteúdo e expansão da rede.

**O AxéMap é gratuito para a comunidade.**
**O Círculo de Apoiadores existe para manter essa gratuidade possível.**

---

## Níveis de Apoio

| Nível | Valor | Descrição |
|---|---|---|
| SEMENTE | R$ 5 | Para quem quer começar a regar esse projeto coletivo. |
| GUARDIÃO | R$ 10 | Ajuda a manter a infraestrutura da plataforma no ar. |
| AXÉ | R$ 15 | Fortalece a manutenção e a moderação comunitária. |
| MEMÓRIA | R$ 20 | Contribui para a digitalização do patrimônio cultural. |
| ANCESTRALIDADE | R$ 50 | Sustenta projetos de preservação e registro histórico. |
| MANTENEDOR | R$ 100 | Parceria institucional de sustentação da plataforma. |

Também é possível contribuir com valor personalizado.

**Os níveis representam reconhecimento e apoio. NÃO representam:**
- Hierarquia religiosa
- Autoridade espiritual
- Importância comunitária
- Influência sobre a plataforma
- Poder de decisão

---

## Periodicidade

- **Mensal** (`MENSAL`): cobrança automática mensal
- **Avulso** (`AVULSO`): contribuição única sem recorrência

---

## Benefícios

Os benefícios são principalmente de reconhecimento e acesso a conteúdo:
- Nome no mural de apoiadores (se não-anônimo)
- Acesso antecipado a novidades
- Relatórios trimestrais de transparência em detalhe
- Newsletter especial de apoiadores
- Reconhecimento especial no mural anual de ancestralidade (ANCESTRALIDADE+)
- Conversa institucional anual com a governança (MANTENEDOR)

**Benefícios que NUNCA serão concedidos:**
- Trust Score maior
- Verificação automática
- Prioridade no mapa
- Remoção de denúncia
- Destaque orgânico disfarçado
- Autoridade sobre comunidades

---

## Fluxo Técnico

```
USUÁRIO CLICA "APOIAR AGORA"
↓
LOGIN / CADASTRO (se necessário)
↓
ESCOLHE NÍVEL + PERIODICIDADE
↓
SISTEMA CRIA ApoioPlataforma (status: PENDENTE)
↓
SISTEMA GERA referência de pagamento (Pix / cartão)
↓
USUÁRIO REALIZA PAGAMENTO
↓
GATEWAY ENVIA WEBHOOK
↓
WebhookService CONFIRMA (idempotente)
↓
ApoioPlataforma.status = CONFIRMADO
↓
NOTIFICAÇÃO + MURAL (se não-anônimo)
```

---

## APIs

| Endpoint | Método | Auth | Descrição |
|---|---|---|---|
| `/apoie/niveis` | GET | Pública | Catálogo de níveis |
| `/apoie/transparencia` | GET | Pública | Dados agregados |
| `/apoie/contribuir` | POST | JWT | Criar apoio |
| `/apoie/minhas-contribuicoes` | GET | JWT | Histórico do usuário |
| `/admin/apoie/contribuicoes` | GET | ADMIN | Lista admin |
| `/admin/apoie/contribuicoes/:id/confirmar` | POST | ADMIN | Confirmar manual |
| `/admin/apoie/contribuicoes/:id/recusar` | POST | ADMIN | Recusar manual |

---

## Área do Apoiador

Rotas web:
- `/apoie` — página de apresentação e níveis
- `/apoie/confirmacao` — confirmação de apoio (a implementar)
- `/minha-conta/apoio` — área do apoiador (a implementar)

---

## Status

| Componente | Status |
|---|---|
| Modelos Prisma | ✅ ApoioPlataforma |
| Backend (service + controllers) | ✅ |
| Frontend (/apoie) | ✅ |
| Testes unitários | ✅ apoie.service.spec.ts |
| Testes de separação Trust/Dinheiro | ✅ trust-money-separation.spec.ts |
| Gateway de pagamento real | ⏳ Aguarda VPS + decisão de gateway |
| Área do apoiador /minha-conta/apoio | ⏳ Pendente |
| Cancelamento de assinatura | ⏳ Pendente gateway |
| Recibos automáticos | ⏳ Pendente gateway |
