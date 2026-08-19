# AxéMap — Segurança de Webhooks

## Princípio

**Nunca confiar apenas no frontend para confirmar pagamento.**

Todos os webhooks de gateway passam por validação de assinatura, idempotência,
registro em audit log e mecanismo de dead-letter.

---

## Segurança

### 1. Assinatura
Cada gateway tem seu próprio algoritmo de assinatura:
- **Mercado Pago**: HMAC-SHA256 com header `x-signature`
- **Stripe**: HMAC-SHA256 com header `stripe-signature`
- **Pagar.me**: hash no payload

O `rawBody` deve ser preservado para validação HMAC.

```typescript
// main.ts — preservar rawBody
app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf;
  }
}));
```

### 2. Idempotência
- Chave: `{provider}:{gatewayRef}:{eventType}` (unique no `PaymentWebhookLog`)
- Em memória no `WebhookService` para dev/test
- Em banco (`PaymentWebhookLog`) para produção
- O mesmo evento processado duas vezes não tem efeito duplo

### 3. Logs
Todo evento recebido é registrado em `AuditLog` com:
- `acao: 'WEBHOOK_PAYMENT_PAID' | 'WEBHOOK_PAYMENT_FAILED' | 'WEBHOOK_REFUND'`
- `entidadeTipo: 'WEBHOOK'`
- `entidadeId: gatewayRef`

### 4. Dead-letter
Eventos com erro de processamento são registrados em:
- `AuditLog` com `acao: 'WEBHOOK_DEAD_LETTER'`
- Payload completo armazenado para reprocessamento manual

### 5. Resposta HTTP
O endpoint `/webhooks/payment` retorna **sempre HTTP 200** ao gateway,
mesmo em caso de erro interno — para evitar reenvio em loop.
O erro é registrado no dead-letter para tratamento posterior.

---

## Fluxo de Processamento

```
GATEWAY ENVIA POST /webhooks/payment
↓
WebhookController RECEBE
↓
Validar rawBody presente
↓
Verificar assinatura (provider-specific)
↓ Se inválida: rejeitar 401
↓
Checar idempotência (gatewayRef + eventType já processado?)
↓ Se duplicado: retornar {processed: false, reason: "DUPLICATE"}
↓
Processar evento:
  payment.paid → confirmar registro no banco
  payment.failed → registrar falha
  refund → registrar reembolso
↓
Registrar AuditLog
↓
Marcar como processado (idempotência)
↓
Retornar HTTP 200 {received: true}
```

---

## PaymentWebhookLog (Prisma)

```prisma
model PaymentWebhookLog {
  provider     String  // MOCK / MERCADO_PAGO / STRIPE
  gatewayRef   String
  eventType    String
  status       String
  origin       String  // APOIO / SUBSCRIPTION / CAMPAIGN / AD
  rawPayload   Json?
  processado   Boolean
  erroMensagem String?
  occurredAt   DateTime
  
  @@unique([provider, gatewayRef, eventType])
}
```

---

## Replay de Eventos

Para reprocessar um evento dead-letter:
1. Admin localiza evento em `/admin/webhooks/dead-letters` (a implementar)
2. Admin aciona reprocessamento manual com confirmação
3. Sistema reprocessa com idempotência

---

## Proteção contra Webhooks Falsos

- Validação de assinatura HMAC antes de qualquer processamento
- IP allowlist por gateway (a configurar no reverse proxy)
- Header `x-axemap-provider` para identificar fonte
- Logs de todas as tentativas de webhook inválido

---

## Status de Implementação

| Componente | Status |
|---|---|
| WebhookService (idempotência em memória) | ✅ |
| WebhookController | ✅ |
| AuditLog de eventos | ✅ |
| Dead-letter via AuditLog | ✅ |
| PaymentWebhookLog (Prisma + migration) | ✅ |
| Testes de segurança (webhook-security.spec.ts) | ✅ |
| rawBody preservation no main.ts | ⏳ Configurar em produção |
| Validação HMAC por provider real | ⏳ Aguarda gateway |
| IP allowlist | ⏳ Configurar no reverse proxy |
| Dashboard dead-letters no admin | ⏳ Frontend pendente |
