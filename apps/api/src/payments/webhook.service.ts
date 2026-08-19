import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/**
 * WebhookService — segurança de webhooks de pagamento.
 *
 * Requisitos (Prompt 14, seção 28):
 * - Assinatura validada pelo provider antes de processar
 * - Idempotência: mesmo evento processado duas vezes não gera efeito duplo
 * - Logs completos de cada evento recebido
 * - Dead-letter: eventos com erro são registrados para reprocessamento
 * - Auditoria de todas as ações financeiras
 * - NUNCA confia apenas no frontend para confirmar pagamento
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  /** Mapa em memória para idempotência em dev (em prod usar Redis ou tabela). */
  private readonly processedEvents = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  /**
   * Processa webhook de pagamento confirmado.
   * Idempotente: re-processar o mesmo gatewayRef não tem efeito.
   */
  async handlePaymentPaid(payload: {
    gatewayRef: string;
    origin: 'APOIO' | 'SUBSCRIPTION' | 'CAMPAIGN' | 'AD';
    amountBRL: number;
    occurredAt: Date;
  }): Promise<{ processed: boolean; reason?: string }> {
    const idempotencyKey = `payment.paid:${payload.gatewayRef}`;

    if (this.processedEvents.has(idempotencyKey)) {
      this.logger.warn(`[Webhook] Evento duplicado ignorado: ${idempotencyKey}`);
      return { processed: false, reason: 'DUPLICATE' };
    }

    this.logger.log(`[Webhook] Processando payment.paid origin=${payload.origin} ref=${payload.gatewayRef}`);

    try {
      if (payload.origin === 'APOIO') {
        await this.confirmarApoio(payload.gatewayRef);
      } else if (payload.origin === 'SUBSCRIPTION') {
        await this.confirmarAssinatura(payload.gatewayRef);
      }
      // AD e CAMPAIGN seguem lógica própria nos módulos correspondentes

      await this.registrarLog('WEBHOOK_PAYMENT_PAID', payload);
      this.processedEvents.add(idempotencyKey);

      return { processed: true };
    } catch (err) {
      this.logger.error(`[Webhook] Erro ao processar ${idempotencyKey}: ${(err as Error).message}`);
      await this.registrarDeadLetter(idempotencyKey, payload, (err as Error).message);
      throw err;
    }
  }

  async handlePaymentFailed(payload: {
    gatewayRef: string;
    origin: string;
    reason?: string;
  }): Promise<void> {
    this.logger.warn(`[Webhook] payment.failed ref=${payload.gatewayRef} reason=${payload.reason}`);
    await this.registrarLog('WEBHOOK_PAYMENT_FAILED', payload);
  }

  async handleRefund(payload: {
    gatewayRef: string;
    refundRef: string;
    amountBRL: number;
    occurredAt: Date;
  }): Promise<void> {
    this.logger.log(`[Webhook] refund ref=${payload.gatewayRef}`);
    await this.registrarLog('WEBHOOK_REFUND', payload);
  }

  // ──────────────────────────────────────────────────────────────
  // Métodos privados
  // ──────────────────────────────────────────────────────────────

  private async confirmarApoio(gatewayRef: string) {
    const apoio = await this.prisma.apoioPlataforma.findFirst({
      where: { gatewayRef },
    });
    if (!apoio) {
      throw new NotFoundException(`ApoioPlataforma não encontrado para gatewayRef=${gatewayRef}`);
    }
    if (apoio.status === 'CONFIRMADO') return; // já confirmado

    await this.prisma.apoioPlataforma.update({
      where: { id: apoio.id },
      data: { status: 'CONFIRMADO', pagoEm: new Date() },
    });
  }

  private async confirmarAssinatura(gatewayRef: string) {
    const pagamento = await this.prisma.planoPagamento.findFirst({
      where: { gatewayRef },
    });
    if (!pagamento) {
      throw new NotFoundException(`PlanoPagamento não encontrado para gatewayRef=${gatewayRef}`);
    }
    if (pagamento.status === 'CONFIRMADO') return;

    await this.prisma.planoPagamento.update({
      where: { id: pagamento.id },
      data: { status: 'CONFIRMADO', pagoEm: new Date() },
    });
  }

  private async registrarLog(acao: string, payload: unknown) {
    try {
      await this.auditLogs.registrar(
        null,
        acao,
        'WEBHOOK',
        (payload as any).gatewayRef ?? 'unknown',
        { depois: payload },
      );
    } catch {
      // Log não deve bloquear o processamento
    }
  }

  private async registrarDeadLetter(key: string, payload: unknown, erro: string) {
    try {
      await this.auditLogs.registrar(
        null,
        'WEBHOOK_DEAD_LETTER',
        'WEBHOOK',
        key,
        { depois: { payload, erro } },
      );
    } catch {
      // silencioso
    }
  }
}
