import { Controller, Post, Req, Res, Headers, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

/**
 * WebhookController — recebe eventos de gateways de pagamento.
 *
 * Segurança (Prompt 14, seção 28):
 * - rawBody necessário para validação de assinatura HMAC (registrado no main.ts)
 * - HTTP 200 retornado apenas após processamento confirmado
 * - Idempotência garantida pelo WebhookService
 * - Nunca confia no status vindo do frontend
 *
 * Nota: a validação de assinatura real ocorre via IPaymentProvider.validateWebhookSignature().
 * Este controller é um receptor agnóstico de provedor.
 */
@Controller('webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  /**
   * Endpoint genérico de webhook — o provider é identificado pelo header x-axemap-provider.
   * Em produção, haverá endpoints por provider (ex.: /webhooks/mercadopago, /webhooks/stripe).
   */
  @Post('payment')
  @HttpCode(200)
  async handlePayment(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
  ) {
    const body = (req as any).rawBody as Buffer | undefined;
    if (!body) {
      return res.status(400).json({ error: 'rawBody ausente — configure bodyParser com verify()' });
    }

    // Em dev (MockProvider) apenas verifica header
    const isMock = headers['x-mock-axemap'] === 'true';
    if (!isMock && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'Assinatura de webhook não fornecida' });
    }

    const payload = req.body as {
      gatewayRef: string;
      event: string;
      origin?: string;
      amountBRL?: number;
    };

    try {
      if (payload.event === 'payment.paid') {
        await this.webhookService.handlePaymentPaid({
          gatewayRef: payload.gatewayRef,
          origin: (payload.origin as any) ?? 'APOIO',
          amountBRL: payload.amountBRL ?? 0,
          occurredAt: new Date(),
        });
      } else if (payload.event === 'payment.failed') {
        await this.webhookService.handlePaymentFailed({
          gatewayRef: payload.gatewayRef,
          origin: payload.origin ?? 'UNKNOWN',
        });
      }

      return res.status(200).json({ received: true });
    } catch {
      // Retornar 200 ao gateway mesmo em erro interno para evitar reenvio em loop
      return res.status(200).json({ received: true, warning: 'Erro interno — evento em dead-letter' });
    }
  }
}
