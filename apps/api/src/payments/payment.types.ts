/**
 * AxéMap Payment Abstraction Layer
 *
 * Princípio: O domínio de negócio NUNCA é acoplado a um único gateway.
 * Nenhuma lógica de Trust, verificação ou reputação é alterada por ações
 * de pagamento — "DINHEIRO NÃO COMPRA CONFIANÇA."
 *
 * Suporte futuro: Mercado Pago, Pagar.me, Stripe, Asaas, …
 */

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

export type WebhookEventType =
  | 'payment.created'
  | 'payment.paid'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.active'
  | 'subscription.cancelled'
  | 'subscription.past_due'
  | 'refund.created'
  | 'refund.completed';

// ──────────────────────────────────────────────────────────────
// DTOs de entrada
// ──────────────────────────────────────────────────────────────

export interface CreatePaymentDto {
  /** Valor em BRL (centavos inteiros quando o provider exigir). */
  amountBRL: number;
  method: PaymentMethod;
  /** Referência interna (ex.: ApoioPlataforma.id, PlanoAssinatura.id). */
  internalRef: string;
  /** Tipo de origem para auditoria. */
  origin: 'APOIO' | 'SUBSCRIPTION' | 'CAMPAIGN' | 'AD';
  payerEmail?: string;
  payerName?: string;
  description?: string;
  expiresInMinutes?: number;
}

export interface CreateSubscriptionDto {
  planId: string;
  cycle: 'MONTHLY' | 'YEARLY';
  amountBRL: number;
  method: PaymentMethod;
  internalRef: string;
  payerEmail?: string;
  payerName?: string;
}

// ──────────────────────────────────────────────────────────────
// DTOs de saída
// ──────────────────────────────────────────────────────────────

export interface PaymentResult {
  gatewayRef: string;
  status: PaymentStatus;
  paymentUrl?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  boletoUrl?: string;
  expiresAt?: Date;
}

export interface SubscriptionResult {
  gatewayRef: string;
  status: PaymentStatus;
  nextBillingAt?: Date;
  paymentUrl?: string;
}

export interface RefundResult {
  gatewayRef: string;
  refundRef: string;
  status: PaymentStatus;
  refundedAt?: Date;
  amountBRL: number;
}

// ──────────────────────────────────────────────────────────────
// Webhook
// ──────────────────────────────────────────────────────────────

export interface IncomingWebhook {
  gatewayRef: string;
  eventType: WebhookEventType;
  status: PaymentStatus;
  amountBRL?: number;
  occurredAt: Date;
  rawPayload: unknown;
}

// ──────────────────────────────────────────────────────────────
// Interface do provider (Adapter Pattern)
// ──────────────────────────────────────────────────────────────

export interface IPaymentProvider {
  readonly name: string;

  createPayment(dto: CreatePaymentDto): Promise<PaymentResult>;
  createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionResult>;
  cancelSubscription(gatewayRef: string): Promise<void>;
  createRefund(gatewayRef: string, amountBRL?: number): Promise<RefundResult>;

  /**
   * Valida a assinatura do webhook recebido.
   * Retorna o payload estruturado se válido; lança exceção se inválido.
   */
  validateWebhookSignature(rawBody: Buffer, headers: Record<string, string>): Promise<IncomingWebhook>;

  getPaymentStatus(gatewayRef: string): Promise<PaymentStatus>;
}

// ──────────────────────────────────────────────────────────────
// Token de injeção
// ──────────────────────────────────────────────────────────────

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
