import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async track(dto: {
    evento: string;
    usuarioId?: string;
    terreiroId?: string;
    sessaoId?: string;
    origem?: string;
    dispositivo?: string;
    versao?: string;
    metadata?: any;
    cidade?: string;
    estado?: string;
  }) {
    return this.prisma.analyticsEvent.create({ data: dto });
  }

  async getAcquisition(periodo: '7d' | '30d' | '90d' = '30d') {
    const from = new Date();
    from.setDate(from.getDate() - { '7d': 7, '30d': 30, '90d': 90 }[periodo]);

    const [novosUsuarios, novosTerreiros, reivindicacoes, convitesEnviados, convitesAceitos] = await Promise.all([
      this.prisma.usuarios.count({ where: { createdAt: { gte: from } } }),
      this.prisma.terreiros.count({ where: { createdAt: { gte: from }, isPublished: true } }),
      this.prisma.claimRequest.count({ where: { createdAt: { gte: from } } }),
      this.prisma.indicacoes.count({ where: { createdAt: { gte: from } } }),
      this.prisma.indicacoes.count({ where: { convertidoEm: { gte: from } } }),
    ]);

    return { periodo, novosUsuarios, novosTerreiros, reivindicacoes, convitesEnviados, convitesAceitos };
  }

  async getActivation() {
    const totalOnboarding = await this.prisma.analyticsEvent.count({
      where: { evento: 'onboarding_iniciado' },
    });
    const totalPublicado = await this.prisma.analyticsEvent.count({
      where: { evento: 'perfil_publicado' },
    });
    const abandonos = await this.prisma.analyticsEvent.count({
      where: { evento: 'onboarding_abandonado' },
    });

    const etapas = await this.getFunnel();

    return {
      taxaConclusao: totalOnboarding > 0 ? Math.round((totalPublicado / totalOnboarding) * 100) : 0,
      totalIniciados: totalOnboarding,
      totalPublicados: totalPublicado,
      abandonos,
      etapaMaiorAbandono: this.getMaiorAbandono(etapas),
      funil: etapas,
    };
  }

  async getEngagement() {
    const now = new Date();
    const mesPassado = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [missoesCompletas, fotosAdicionadas, eventosPublicados, avaliacoes] = await Promise.all([
      this.prisma.userMission.count({ where: { completadoEm: { gte: mesPassado }, completo: true } }),
      this.prisma.terreiroFoto.count({ where: { createdAt: { gte: mesPassado } } }),
      this.prisma.eventos.count({ where: { createdAt: { gte: mesPassado } } }),
      this.prisma.avaliacoes.count({ where: { createdAt: { gte: mesPassado } } }),
    ]);

    return { missoesCompletas, fotosAdicionadas, eventosPublicados, avaliacoes };
  }

  async getRetention() {
    const now = new Date();
    const nowMinus7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nowMinus30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const eventos7d = await this.prisma.analyticsEvent.groupBy({
      by: ['usuarioId'],
      where: { timestamp: { gte: nowMinus7 }, evento: { not: 'pagina_vista' } },
      _count: { id: true },
    });
    const eventos30d = await this.prisma.analyticsEvent.groupBy({
      by: ['usuarioId'],
      where: { timestamp: { gte: nowMinus30 }, evento: { not: 'pagina_vista' } },
      _count: { id: true },
    });
    const usuariosAtivos = await this.prisma.usuarios.count({
      where: { deletedAt: null },
    });

    const wau = eventos7d.length;
    const mau = eventos30d.length;

    return {
      wau,
      mau,
      retorno7d: usuariosAtivos > 0 ? Math.round((wau / usuariosAtivos) * 100) : 0,
      retorno30d: usuariosAtivos > 0 ? Math.round((mau / usuariosAtivos) * 100) : 0,
      totalUsuarios: usuariosAtivos,
    };
  }

  async getFunnel() {
    const totais = await Promise.all([
      this.prisma.analyticsEvent.count({ where: { evento: 'pagina_visitada' } }).then(c => ({ etapa: 'Visitante', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'usuario_cadastrado' } }).then(c => ({ etapa: 'Conta criada', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'onboarding_iniciado' } }).then(c => ({ etapa: 'Onboarding iniciado', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'perfil_publicado' } }).then(c => ({ etapa: 'Perfil publicado', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'missao_completa' } }).then(c => ({ etapa: 'Missão completa', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'evento_criado' } }).then(c => ({ etapa: 'Evento criado', valor: c })),
      this.prisma.analyticsEvent.count({ where: { evento: 'convite_enviado' } }).then(c => ({ etapa: 'Convite enviado', valor: c })),
    ]);

    return totais;
  }

  private getMaiorAbandono(funil: { etapa: string; valor: number }[]) {
    for (let i = 1; i < funil.length; i++) {
      const queda = funil[i - 1].valor - funil[i].valor;
      if (queda > 0 && funil[i - 1].valor > 0) {
        const pct = Math.round((queda / funil[i - 1].valor) * 100);
        if (pct > 20) return { etapa: funil[i].etapa, queda: pct };
      }
    }
    return null;
  }
}
