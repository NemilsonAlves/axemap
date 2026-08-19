/**
 * TESTE: Segurança de Webhooks
 *
 * Garante:
 * - Idempotência: o mesmo evento não é processado duas vezes
 * - Eventos inválidos são rejeitados
 * - Dead-letter é registrado em caso de erro
 * - Confirmação de pagamento é feita apenas via webhook (nunca via frontend)
 *
 * Referência: Prompt 14, seção 28.
 */

import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhookService } from '../../payments/webhook.service';
import { PrismaService } from '../../database/prisma.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

describe('WebhookService — Segurança e Idempotência', () => {
  let webhookService: WebhookService;
  let prisma: any;
  let auditLogs: any;

  beforeEach(async () => {
    prisma = {
      apoioPlataforma: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      planoPagamento: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    auditLogs = { registrar: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
      ],
    }).compile();

    webhookService = moduleRef.get(WebhookService);
  });

  // ──────────────────────────────────────────────────────────────
  // Idempotência
  // ──────────────────────────────────────────────────────────────

  it('processar payment.paid duas vezes com mesmo gatewayRef é idempotente', async () => {
    prisma.apoioPlataforma.findFirst.mockResolvedValue({
      id: 'ap1',
      status: 'PENDENTE',
      gatewayRef: 'GW-001',
    });
    prisma.apoioPlataforma.update.mockResolvedValue({
      id: 'ap1',
      status: 'CONFIRMADO',
    });

    const payload = {
      gatewayRef: 'GW-001',
      origin: 'APOIO' as const,
      amountBRL: 100,
      occurredAt: new Date(),
    };

    const primeiro = await webhookService.handlePaymentPaid(payload);
    const segundo = await webhookService.handlePaymentPaid(payload);

    expect(primeiro.processed).toBe(true);
    expect(segundo.processed).toBe(false);
    expect(segundo.reason).toBe('DUPLICATE');

    // Update só foi chamado uma vez
    expect(prisma.apoioPlataforma.update).toHaveBeenCalledTimes(1);
  });

  // ──────────────────────────────────────────────────────────────
  // Confirmação apenas por webhook
  // ──────────────────────────────────────────────────────────────

  it('confirmar apoio via webhook atualiza status para CONFIRMADO', async () => {
    prisma.apoioPlataforma.findFirst.mockResolvedValue({
      id: 'ap1',
      status: 'PENDENTE',
      gatewayRef: 'GW-002',
    });
    prisma.apoioPlataforma.update.mockResolvedValue({
      id: 'ap1',
      status: 'CONFIRMADO',
    });

    await webhookService.handlePaymentPaid({
      gatewayRef: 'GW-002',
      origin: 'APOIO',
      amountBRL: 50,
      occurredAt: new Date(),
    });

    expect(prisma.apoioPlataforma.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ap1' },
        data: expect.objectContaining({ status: 'CONFIRMADO' }),
      }),
    );
  });

  it('gatewayRef não encontrado lança NotFoundException e registra dead-letter', async () => {
    prisma.apoioPlataforma.findFirst.mockResolvedValue(null);

    await expect(
      webhookService.handlePaymentPaid({
        gatewayRef: 'GW-INEXISTENTE',
        origin: 'APOIO',
        amountBRL: 50,
        occurredAt: new Date(),
      }),
    ).rejects.toThrow(NotFoundException);

    // Dead-letter deve ser registrado
    expect(auditLogs.registrar).toHaveBeenCalledWith(
      null,
      'WEBHOOK_DEAD_LETTER',
      'WEBHOOK',
      expect.stringContaining('GW-INEXISTENTE'),
      expect.any(Object),
    );
  });

  it('já confirmado não re-executa update', async () => {
    prisma.apoioPlataforma.findFirst.mockResolvedValue({
      id: 'ap1',
      status: 'CONFIRMADO', // já confirmado
      gatewayRef: 'GW-003',
    });

    await webhookService.handlePaymentPaid({
      gatewayRef: 'GW-003',
      origin: 'APOIO',
      amountBRL: 10,
      occurredAt: new Date(),
    });

    // Não deve atualizar porque já está confirmado
    expect(prisma.apoioPlataforma.update).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────
  // Auditoria
  // ──────────────────────────────────────────────────────────────

  it('payment.paid bem-sucedido registra audit log', async () => {
    prisma.apoioPlataforma.findFirst.mockResolvedValue({
      id: 'ap1',
      status: 'PENDENTE',
      gatewayRef: 'GW-004',
    });
    prisma.apoioPlataforma.update.mockResolvedValue({ id: 'ap1', status: 'CONFIRMADO' });

    await webhookService.handlePaymentPaid({
      gatewayRef: 'GW-004',
      origin: 'APOIO',
      amountBRL: 100,
      occurredAt: new Date(),
    });

    expect(auditLogs.registrar).toHaveBeenCalledWith(
      null,
      'WEBHOOK_PAYMENT_PAID',
      'WEBHOOK',
      'GW-004',
      expect.any(Object),
    );
  });

  it('payment.failed registra audit log sem lançar exceção', async () => {
    await webhookService.handlePaymentFailed({
      gatewayRef: 'GW-005',
      origin: 'APOIO',
      reason: 'insufficient_funds',
    });

    expect(auditLogs.registrar).toHaveBeenCalledWith(
      null,
      'WEBHOOK_PAYMENT_FAILED',
      'WEBHOOK',
      'GW-005',
      expect.any(Object),
    );
  });
});
