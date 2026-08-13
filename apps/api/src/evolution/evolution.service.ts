import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { missionsSeed, achievementsSeed } from './seed';

@Injectable()
export class EvolutionService {
  constructor(private prisma: PrismaService) {}

  async getMyDashboard(usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findFirst({
      where: { dirigenteId: usuarioId, deletedAt: null },
      select: { id: true },
    });
    if (!terreiro) {
      return { error: true, message: 'Você ainda não cadastrou um terreiro', needsSetup: true };
    }
    return this.getDashboard(terreiro.id, usuarioId);
  }

  async getDashboard(terreiroId: string, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      include: {
        fotos: true,
        eventos: { where: { deletedAt: null } },
        cursos: { where: { deletedAt: null } },
        acoesSociais: { where: { deletedAt: null } },
        avaliacoes: { where: { deletedAt: null } },
        missoesUsuario: { where: { usuarioId } },
        conquistasUsuario: { where: { usuarioId } },
        axScoreHistory: { orderBy: { createdAt: 'desc' }, take: 30 },
        acoesEvolucao: { orderBy: { createdAt: 'desc' }, take: 50 },
        metasEvolucao: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    await this.ensureMissionsSeeded();
    await this.ensureAchievementsSeeded();

    const missoesDisponiveis = await this.prisma.mission.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });

    const conquistasDisponiveis = await this.prisma.achievement.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });

    const userMissions = terreiro.missoesUsuario;
    const userAchievements = terreiro.conquistasUsuario;

    const progressoMissoes = missoesDisponiveis.map((m) => {
      const userM = userMissions.find((u) => u.missionId === m.id);
      const completed = userM?.completo || false;
      return {
        id: m.id,
        key: m.key,
        titulo: m.titulo,
        descricao: m.descricao,
        categoria: m.categoria,
        rewardAxScore: m.rewardAxScore,
        rewardTrustScore: m.rewardTrustScore,
        progresso: userM?.progresso || 0,
        completo: completed,
        completadoEm: userM?.completadoEm || null,
      };
    });

    const conquistasObtidas = conquistasDisponiveis.map((a) => ({
      id: a.id,
      key: a.key,
      titulo: a.titulo,
      descricao: a.descricao,
      icone: a.icone,
      categoria: a.categoria,
      rewardAxScore: a.rewardAxScore,
      obtida: userAchievements.some((u) => u.achievementId === a.id),
      earnedAt: userAchievements.find((u) => u.achievementId === a.id)?.earnedAt || null,
    }));

    const axScore = await this.calcularAxScore(terreiro, progressoMissoes, conquistasObtidas);
    const comparacao = await this.getComparacaoMedia(terreiro);

    return {
      axScore,
      completude: this.calcularCompletude(terreiro),
      missoes: progressoMissoes,
      conquistas: conquistasObtidas,
      comparacao,
      historico: terreiro.axScoreHistory,
      acoes: terreiro.acoesEvolucao,
      metas: terreiro.metasEvolucao,
      stats: {
        totalMissoes: progressoMissoes.length,
        missoesCompletas: progressoMissoes.filter((m) => m.completo).length,
        totalConquistas: conquistasObtidas.length,
        conquistasObtidas: conquistasObtidas.filter((a) => a.obtida).length,
      },
    };
  }

  async logAction(
    terreiroId: string,
    usuarioId: string,
    actionType: string,
    descricao: string,
    metadata?: any,
  ) {
    const action = await this.prisma.evolutionAction.create({
      data: { actionType, descricao, terreiroId, usuarioId, metadata: metadata || {} },
    });
    await this.evaluateMissions(terreiroId, usuarioId);
    await this.evaluateAchievements(terreiroId, usuarioId);
    return action;
  }

  async evaluateMissions(terreiroId: string, usuarioId: string) {
    const terreiro = await this.getTerreiroData(terreiroId);
    const missoes = await this.prisma.mission.findMany({ where: { ativo: true } });

    for (const mission of missoes) {
      const existing = await this.prisma.userMission.findUnique({
        where: {
          usuarioId_terreiroId_missionId: {
            usuarioId, terreiroId, missionId: mission.id,
          },
        },
      });

      if (existing?.completo) continue;

      const progresso = await this.checarProgresso(mission, terreiro);
      const completo = progresso >= 100;

      await this.prisma.userMission.upsert({
        where: {
          usuarioId_terreiroId_missionId: {
            usuarioId, terreiroId, missionId: mission.id,
          },
        },
        create: {
          usuarioId, terreiroId, missionId: mission.id,
          progresso, completo,
          completadoEm: completo ? new Date() : null,
        },
        update: {
          progresso, completo,
          completadoEm: completo && !existing?.completo ? new Date() : undefined,
        },
      });

      if (completo && (!existing || !existing.completo)) {
        await this.addScoreDelta(terreiroId, mission.rewardAxScore, `Missão: ${mission.titulo}`);
        if (mission.rewardTrustScore > 0) {
          await this.prisma.terreiros.update({
            where: { id: terreiroId },
            data: { trustScore: { increment: mission.rewardTrustScore } },
          });
        }
        await this.prisma.evolutionAction.create({
          data: {
            usuarioId, terreiroId,
            actionType: 'MISSAO_COMPLETA',
            descricao: `Missão "${mission.titulo}" concluída! +${mission.rewardAxScore} AxéScore`,
            axScoreDelta: mission.rewardAxScore,
            trustScoreDelta: mission.rewardTrustScore,
          },
        });
      }
    }

    return { success: true };
  }

  async evaluateAchievements(terreiroId: string, usuarioId: string) {
    const terreiro = await this.getTerreiroData(terreiroId);
    const conquistas = await this.prisma.achievement.findMany({ where: { ativo: true } });

    for (const achievement of conquistas) {
      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          usuarioId_terreiroId_achievementId: {
            usuarioId, terreiroId, achievementId: achievement.id,
          },
        },
      });

      if (existing) continue;

      const earned = await this.checarConquista(achievement, terreiro);
      if (earned) {
        await this.prisma.userAchievement.create({
          data: { usuarioId, terreiroId, achievementId: achievement.id },
        });
        await this.addScoreDelta(terreiroId, achievement.rewardAxScore, `Conquista: ${achievement.titulo}`);
        await this.prisma.evolutionAction.create({
          data: {
            usuarioId, terreiroId,
            actionType: 'CONQUISTA_OBTIDA',
            descricao: `Conquista "${achievement.titulo}" obtida! +${achievement.rewardAxScore} AxéScore`,
            axScoreDelta: achievement.rewardAxScore,
          },
        });
      }
    }
  }

  async createGoal(terreiroId: string, data: { titulo: string; descricao?: string; targetDate?: string }) {
    return this.prisma.evolutionGoal.create({
      data: {
        terreiroId,
        titulo: data.titulo,
        descricao: data.descricao,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });
  }

  async completeGoal(goalId: string) {
    return this.prisma.evolutionGoal.update({
      where: { id: goalId },
      data: { completado: true, completadoEm: new Date() },
    });
  }

  private async addScoreDelta(terreiroId: string, delta: number, razao: string) {
    const current = await this.prisma.axScoreHistory.findFirst({
      where: { terreiroId },
      orderBy: { createdAt: 'desc' },
    });
    const newScore = Math.min(100, Math.max(0, (current?.score || 0) + delta));
    await this.prisma.axScoreHistory.create({
      data: { terreiroId, score: newScore, delta, razao },
    });
  }

  private async calcularAxScore(terreiro: any, missoes: any[], conquistas: any[]) {
    const completude = this.calcularCompletude(terreiro);
    const trust = terreiro.trustScore;
    const missoesPct = missoes.length > 0
      ? (missoes.filter((m: any) => m.completo).length / missoes.length) * 100
      : 0;
    const conquistasPct = conquistas.length > 0
      ? (conquistas.filter((a: any) => a.obtida).length / conquistas.length) * 100
      : 0;

    const totalAvaliacoes = terreiro.avaliacoes?.length || 0;
    const totalFavoritos = (terreiro as any)._count?.favoritos || 0;
    const engagement = Math.min(100, ((totalAvaliacoes * 5) + (totalFavoritos * 2)) * 2);

    const idadeDias = Math.ceil(
      (Date.now() - new Date(terreiro.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    const antiguidade = Math.min(100, idadeDias * 0.5);

    const score = Math.round(
      completude * 0.30 +
      trust * 0.25 +
      missoesPct * 0.15 +
      conquistasPct * 0.10 +
      engagement * 0.10 +
      antiguidade * 0.10,
    );

    return Math.min(100, Math.max(0, score));
  }

  private calcularCompletude(terreiro: any) {
    const checks = [
      !!terreiro.fotoUrl, !!terreiro.descricaoLonga, !!terreiro.telefone,
      !!terreiro.whatsapp, !!terreiro.instagram, !!terreiro.website,
      !!terreiro.horarioFuncionamento, (terreiro.fotos?.length || 0) > 0,
      (terreiro.eventos?.length || 0) > 0, !!terreiro.anoFundacao,
      !!terreiro.linhagem, !!terreiro.acessibilidade,
    ];
    const total = 12;
    const ok = checks.filter(Boolean).length;
    return Math.round((ok / total) * 100);
  }

  private async getComparacaoMedia(terreiro: any) {
    const cidadeData = await this.getMediaPorFiltro({ cidade: terreiro.cidade });
    const estadoData = await this.getMediaPorFiltro({ estado: terreiro.estado });

    return {
      cidade: {
        axScoreMedio: cidadeData.axScoreMedio,
        trustScoreMedio: cidadeData.trustScoreMedio,
        completudeMedia: cidadeData.completudeMedia,
        totalTerreiros: cidadeData.total,
      },
      estado: {
        axScoreMedio: estadoData.axScoreMedio,
        trustScoreMedio: estadoData.trustScoreMedio,
        completudeMedia: estadoData.completudeMedia,
        totalTerreiros: estadoData.total,
      },
    };
  }

  private async getMediaPorFiltro(filtro: { cidade?: string; estado?: string }) {
    const terreiros = await this.prisma.terreiros.findMany({
      where: { ...filtro, deletedAt: null, isPublished: true },
      select: { trustScore: true, fotos: { take: 1 }, eventos: { take: 1 } },
    });

    if (terreiros.length === 0) {
      return { axScoreMedio: 0, trustScoreMedio: 0, completudeMedia: 0, total: 0 };
    }

    const trustScoreMedio = Math.round(
      terreiros.reduce((s: number, t: any) => s + t.trustScore, 0) / terreiros.length,
    );

    return {
      trustScoreMedio,
      total: terreiros.length,
    };
  }

  private async getTerreiroData(terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      include: {
        fotos: { take: 1 },
        eventos: { where: { deletedAt: null }, take: 1 },
        cursos: { where: { deletedAt: null }, take: 1 },
        acoesSociais: { where: { deletedAt: null }, take: 1 },
        avaliacoes: { where: { deletedAt: null } },
        documentosVerificacao: { take: 1 },
      },
    });
    if (!terreiro) throw new NotFoundException();
    return terreiro;
  }

  private async checarProgresso(mission: any, terreiro: any): Promise<number> {
    const req = mission.requisitos as any;
    if (!req) return 0;

    switch (req.type) {
      case 'field':
        return (terreiro as any)[req.field] ? 100 : 0;
      case 'anyField':
        return req.fields.some((f: string) => !!(terreiro as any)[f]) ? 100 : 0;
      case 'count':
        return Math.min(100, Math.round((((terreiro as any)[req.model]?.length || 0) / req.min) * 100));
      case 'trustScore':
        return (terreiro.trustScore || 0) >= req.min ? 100 : Math.round(((terreiro.trustScore || 0) / req.min) * 100);
      default:
        return 0;
    }
  }

  private async checarConquista(achievement: any, terreiro: any): Promise<boolean> {
    const req = achievement.requisitos as any;
    if (!req) return false;

    switch (req.type) {
      case 'automatic':
        return true;
      case 'completeness':
        return this.calcularCompletude(terreiro) >= req.min;
      case 'count':
        return ((terreiro as any)[req.model]?.length || 0) >= req.min;
      case 'allFields':
        return req.fields.every((f: string) => !!(terreiro as any)[f]);
      case 'trustScore':
        return (terreiro.trustScore || 0) >= req.min;
      case 'favoritos':
        return false;
      case 'avaliacoes':
        return false;
      case 'verification':
        return terreiro.verificationLevel === 'DOCUMENTAL' || terreiro.verificationLevel === 'COMUNITARIO' || terreiro.verificationLevel === 'AVANCADO' || terreiro.verificationLevel === 'COMPLETO';
      case 'age': {
        const idadeDias = Math.ceil(
          (Date.now() - new Date(terreiro.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        return idadeDias >= req.minDays;
      }
      default:
        return false;
    }
  }

  private async ensureMissionsSeeded() {
    for (const m of missionsSeed) {
      await this.prisma.mission.upsert({
        where: { key: m.key },
        create: m as any,
        update: m as any,
      });
    }
  }

  private async ensureAchievementsSeeded() {
    for (const a of achievementsSeed) {
      await this.prisma.achievement.upsert({
        where: { key: a.key },
        create: a as any,
        update: a as any,
      });
    }
  }
}
