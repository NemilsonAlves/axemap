import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  IPaymentProvider,
  CreatePaymentDto,
  CreateSubscriptionDto,
  PaymentResult,
  SubscriptionResult,
  RefundResult,
  IncomingWebhook,
  PaymentStatus,
} from './payment.types';

/**
 * MockPaymentProvider — usado em desenvolvimento enquanto não há gateway real.
 *
 * IMPORTANTE:
 * - Nunca simula confirmação automática de pagamento.
 * - Todos os pagamentos ficam em PENDING até confirmação manual pelo admin
 *   (mesmo padrão de ApoieService e SaasService já existentes).
 * - Este provider NÃO é usado em produção.
 */
@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  readonly name = 'MOCK';
  private readonly logger = new Logger(MockPaymentProvider.name);

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResult> {
    this.logger.warn(`[MOCK] createPayment origin=${dto.origin} ref=${dto.internalRef} amount=R$${dto.amountBRL}`);

    const pixCopyPaste =
      `00020126AXEMAP_${dto.internalRef.slice(0, 8).toUpperCase()}` +
      `52040000530398654${String(Math.round(dto.amountBRL * 100)).padStart(10, '0')}` +
      `5802BR5907AXEMAP6007BRASIL62070503***6304MOCK`;

    return {
      gatewayRef: `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: 'PENDING',
      pixCopyPaste,
      expiresAt: new Date(Date.now() + (dto.expiresInMinutes ?? 30) * 60 * 1000),
    };
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionResult> {
    this.logger.warn(`[MOCK] createSubscription plan=${dto.planId} ref=${dto.internalRef}`);
    return {
      gatewayRef: `MOCK-SUB-${Date.now()}`,
      status: 'PENDING',
    };
  }

  async cancelSubscription(gatewayRef: string): Promise<void> {
    this.logger.warn(`[MOCK] cancelSubscription ref=${gatewayRef}`);
  }

  async createRefund(gatewayRef: string, amountBRL?: number): Promise<RefundResult> {
    this.logger.warn(`[MOCK] createRefund ref=${gatewayRef} amount=${amountBRL}`);
    return {
      gatewayRef,
      refundRef: `MOCK-REF-${Date.now()}`,
      status: 'REFUNDED',
      refundedAt: new Date(),
      amountBRL: amountBRL ?? 0,
    };
  }

  async validateWebhookSignature(
    _rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<IncomingWebhook> {
    // Em dev, aceita qualquer webhook com header x-mock-axemap: true
    if (headers['x-mock-axemap'] !== 'true') {
      throw new BadRequestException('Webhook inválido: header x-mock-axemap ausente em modo MOCK');
    }
    return {
      gatewayRef: headers['x-mock-ref'] ?? 'MOCK-REF',
      eventType: 'payment.paid',
      status: 'PAID',
      amountBRL: 0,
      occurredAt: new Date(),
      rawPayload: {},
    };
  }

  async getPaymentStatus(_gatewayRef: string): Promise<PaymentStatus> {
    return 'PENDING';
  }
}
