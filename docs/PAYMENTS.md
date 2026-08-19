# AxéMap — Pagamentos

## Arquitetura

O AxéMap usa uma **Abstraction Layer** para pagamentos que desacopla o domínio de negócio de qualquer gateway específico.

```
DOMÍNIO (ApoieService, SaasService, AdsService)
↓
IPaymentProvider (interface)
↓
MockPaymentProvider (dev)
MercadoPagoProvider (produção — a implementar)
StripeProvider (internacional — a implementar)
```

---

## Interface IPaymentProvider

```typescript
interface IPaymentProvider {
  createPayment(dto: CreatePaymentDto): Promise<PaymentResult>
  createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionResult>
  cancelSubscription(gatewayRef: string): Promise<void>
  createRefund(gatewayRef: string, amountBRL?: number): Promise<RefundResult>
  validateWebhookSignature(rawBody, headers): Promise<IncomingWebhook>
  getPaymentStatus(gatewayRef: string): Promise<PaymentStatus>
}
```

---

## Troca de Provider (Zero Downtime)

Para trocar `MockPaymentProvider` por `MercadoPagoProvider`:
1. Criar `apps/api/src/payments/mercadopago.provider.ts` implementando `IPaymentProvider`
2. Em `payments.module.ts`, trocar `useClass: MockPaymentProvider` → `useClass: MercadoPagoProvider`
3. Nenhum módulo de domínio precisa ser alterado

---

## Estados de Pagamento

```
PENDING     — criado, aguardando pagamento
PROCESSING  — processando no gateway
PAID        — confirmado pelo webhook
FAILED      — falhou
CANCELLED   — cancelado
REFUNDED    — reembolsado
EXPIRED     — prazo expirado
```

---

## Métodos de Pagamento Suportados

| Método | Status |
|---|---|
| PIX (mock) | ✅ Dev |
| PIX (real) | ⏳ Aguarda gateway |
| Cartão de Crédito | ⏳ Aguarda gateway |
| Boleto | ⏳ Aguarda gateway |

---

## Fluxo de Confirmação

**NUNCA** confiar no frontend para confirmar pagamento.

```
FRONTEND INICIA PAGAMENTO
↓
BACKEND CRIA REGISTRO (status: PENDING)
↓
GATEWAY PROCESSA
↓
GATEWAY ENVIA WEBHOOK (assinado)
↓
WebhookController RECEBE
↓
WebhookService VALIDA ASSINATURA
↓
WebhookService CONFIRMA IDEMPOTENTEMENTE
↓
REGISTRO ATUALIZADO (status: PAID)
↓
BENEFÍCIO LIBERADO (se aplicável)
```

---

## Assinaturas (Subscription)

Estados:

| Estado | Descrição |
|---|---|
| PENDENTE | Criada, aguardando pagamento |
| ATIVO | Pago e ativo |
| ATRASADO | Cobrança falhou |
| EXPIRADO | Período expirado sem renovação |
| CANCELADO | Cancelado pelo usuário ou admin |

Cancelamento:
- Usuário cancela via `/minha-conta`
- Sem dark patterns — fluxo simples e direto
- Cancelamento imediato, não ao fim do período (opção configurável)

---

## Segurança de Webhooks

Ver [WEBHOOKS.md](./WEBHOOKS.md).

---

## Provedores Planejados

| Provider | Uso | Status |
|---|---|---|
| MockPaymentProvider | Dev/teste | ✅ |
| Mercado Pago | Mercado brasileiro (PIX + cartão + boleto) | ⏳ |
| Pagar.me | Alternativa brasileira | ⏳ |
| Stripe | Internacional (USD/EUR) | ⏳ |
| Asaas | Cobranças recorrentes BR | ⏳ |

---

## Nota Legal

Contribuições de apoio são classificadas como **"contribuição de apoio"** ou **"apoio ao AxéMap"** — não como "doação dedutível" — até que exista enquadramento jurídico e tributário correspondente validado por profissional habilitado.

---

## Status de Implementação

| Componente | Status |
|---|---|
| Interface IPaymentProvider | ✅ |
| MockPaymentProvider (dev) | ✅ |
| WebhookService (idempotência + dead-letter) | ✅ |
| WebhookController | ✅ |
| PaymentsModule | ✅ |
| PaymentWebhookLog (Prisma model + migration) | ✅ |
| MercadoPagoProvider | ⏳ Aguarda VPS e credenciais |
| Área /minha-conta/apoio | ⏳ Pendente |
| Recibos automáticos | ⏳ Pendente gateway |
