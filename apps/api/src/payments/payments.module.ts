import { Module } from '@nestjs/common';
import { MockPaymentProvider } from './mock-payment.provider';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PAYMENT_PROVIDER } from './payment.types';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

/**
 * PaymentsModule — abstraction layer de pagamentos.
 *
 * Troca o provider injetando uma implementação diferente de IPaymentProvider
 * sem alterar nenhum módulo de domínio (ApoieModule, SaasModule, etc.).
 *
 * Para trocar de MockPaymentProvider para MercadoPagoProvider:
 * 1. Criar apps/api/src/payments/mercadopago.provider.ts implementando IPaymentProvider
 * 2. Substituir useClass abaixo por MercadoPagoProvider
 * 3. Sem nenhuma alteração nos módulos de domínio.
 */
@Module({
  imports: [AuditLogsModule],
  controllers: [WebhookController],
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useClass: MockPaymentProvider,
    },
    MockPaymentProvider,
    WebhookService,
  ],
  exports: [PAYMENT_PROVIDER, WebhookService],
})
export class PaymentsModule {}
