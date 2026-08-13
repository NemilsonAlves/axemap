import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SystemService } from '../system/system.service';

@Injectable()
export class MonitorAdminService {
  constructor(
    private prisma: PrismaService,
    private systemService: SystemService,
  ) {}

  async mapa() {
    const [porEstado, porCidade, graphPorEstado, entidadesSemCoordenadas, publicados, comFoto] =
      await Promise.all([
        this.prisma.terreiros.groupBy({
          by: ['estado'],
          where: { deletedAt: null },
          _count: { _all: true },
          orderBy: { _count: { estado: 'desc' } },
        }),
        this.prisma.terreiros.groupBy({
          by: ['cidade', 'estado'],
          where: { deletedAt: null, isPublished: true },
          _count: { _all: true },
          orderBy: { _count: { cidade: 'desc' } },
          take: 10,
        }),
        this.prisma.graphEntidade.groupBy({
          by: ['estado'],
          where: { deletedAt: null },
          _count: { _all: true },
          orderBy: { _count: { estado: 'desc' } },
        }),
        this.prisma.graphEntidade.count({
          where: { deletedAt: null, latitude: null, longitude: null },
        }),
        this.prisma.terreiros.count({ where: { deletedAt: null, isPublished: true } }),
        this.prisma.terreiros.count({ where: { deletedAt: null, fotoUrl: { not: null } } }),
      ]);

    return {
      terreiros: {
        publicados,
        comFoto,
        porEstado: porEstado.map((e) => ({ estado: e.estado, total: e._count._all })),
        topCidades: porCidade.map((c) => ({
          cidade: c.cidade,
          estado: c.estado,
          total: c._count._all,
        })),
      },
      grafo: {
        entidadesSemCoordenadas,
        porEstado: graphPorEstado.map((e) => ({ estado: e.estado, total: e._count._all })),
      },
    };
  }

  async integracoes() {
    const health = await this.systemService.health();
    const env = process.env;

    const integracoes = {
      database: health.checks.database,
      redis: health.checks.redis,
      storage: health.checks.storage,
      email: {
        configurado: Boolean(env.RESEND_API_KEY || env.SMTP_HOST),
        provedor: env.RESEND_API_KEY ? 'Resend' : env.SMTP_HOST ? 'SMTP' : null,
      },
      whatsapp: {
        configurado: Boolean(env.WHATSAPP_API_URL || env.TWILIO_ACCOUNT_SID),
      },
      maps: {
        configurado: Boolean(env.GOOGLE_MAPS_API_KEY || env.MAPBOX_TOKEN),
      },
      ia: {
        configurado: Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GEMINI_API_KEY),
      },
      oauth: {
        configurado: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
        provedor: env.GOOGLE_CLIENT_ID ? 'Google' : null,
      },
      pagamentos: {
        configurado: Boolean(env.ASAAS_API_KEY || env.MERCADO_PAGO_TOKEN || env.STRIPE_SECRET_KEY),
        provedor: env.ASAAS_API_KEY ? 'Asaas' : env.MERCADO_PAGO_TOKEN ? 'Mercado Pago' : env.STRIPE_SECRET_KEY ? 'Stripe' : null,
      },
    };

    return {
      status: health.status,
      timestamp: health.timestamp,
      integracoes,
    };
  }

  async jobs() {
    const [denunciasAbertas, reivindicacoesPendentes, documentosPendentes, mediacoesAtivas, campanhasAnalise] =
      await Promise.all([
        this.prisma.denuncias.count({ where: { status: { in: ['PENDENTE', 'EM_ANALISE'] } } }),
        this.prisma.claimRequest.count({ where: { status: 'PENDENTE' } }),
        this.prisma.documentosVerificacao.count({ where: { status: 'PENDENTE' } }),
        this.prisma.mediacoes.count({
          where: { status: { in: ['REGISTRADA', 'EM_MEDIACAO', 'AGUARDANDO_RESPOSTA'] } },
        }),
        this.prisma.campanhas.count({ where: { status: 'PENDENTE_ANALISE' } }),
      ]);

    return {
      queues: [],
      filaAguardandoAcao: {
        denunciasAbertas,
        reivindicacoesPendentes,
        documentosPendentes,
        mediacoesAtivas,
        campanhasEmAnalise: campanhasAnalise,
        total: denunciasAbertas + reivindicacoesPendentes + documentosPendentes + mediacoesAtivas + campanhasAnalise,
      },
    };
  }
}
