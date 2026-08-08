import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { WeightConfig } from './recommendation-weights';
import {
  Recomendacao, FatorRecomendacao, ContextoRecomendacao,
  EventoSimples, CursoSimples, BlocoHome,
} from './recommendation.types';

interface TerreiroParaScore {
  id: string; nome: string; slug: string; tradicao: string;
  trustScore: number; isVerified: boolean;
  cidade: string; estado: string;
  latitude: number; longitude: number;
  descricaoCurta: string | null; fotoUrl: string | null;
  updatedAt: Date;
  distancia?: number;
  totalFavoritos?: number;
  totalAvaliacoes?: number;
  mediaAvaliacoes?: number;
  totalEventos?: number;
  totalCursos?: number;
}

@Injectable()
export class RecommendationEngine {
  private weights: WeightConfig;

  constructor(private prisma: PrismaService) {
    this.weights = new WeightConfig();
  }

  setWeights(pesos?: Partial<import('./recommendation.types').PesoRecomendacao>): void {
    this.weights = new WeightConfig(pesos);
  }

  async recomendar(contexto: ContextoRecomendacao, limite = 20): Promise<Recomendacao[]> {
    const terreiros = await this.carregarTerreiros(contexto);
    const scores = this.calcularScores(terreiros, contexto);
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);
  }

  async homeBlocos(contexto: ContextoRecomendacao): Promise<BlocoHome[]> {
    const blocos: BlocoHome[] = [];

    const [
      topAvaliados, verificados, novos, eventos, cursos, proximos,
    ] = await Promise.all([
      this.recomendar(contexto, 6),
      this.prisma.terreiros.findMany({
        where: { isVerified: true, deletedAt: null, isPublished: true },
        orderBy: { trustScore: 'desc' },
        take: 6,
        select: { id: true, nome: true, slug: true, tradicao: true, trustScore: true, isVerified: true, cidade: true, estado: true, latitude: true, longitude: true, descricaoCurta: true, fotoUrl: true, updatedAt: true },
      }),
      this.prisma.terreiros.findMany({
        where: { deletedAt: null, isPublished: true },
        orderBy: { publicadoEm: 'desc' },
        take: 6,
        select: { id: true, nome: true, slug: true, tradicao: true, trustScore: true, isVerified: true, cidade: true, estado: true, latitude: true, longitude: true, descricaoCurta: true, fotoUrl: true, updatedAt: true },
      }),
      this.prisma.eventos.findMany({
        where: { deletedAt: null, dataInicio: { gte: new Date() } },
        orderBy: { dataInicio: 'asc' },
        take: 6,
        include: { terreiro: { select: { nome: true, slug: true, cidade: true, estado: true } } },
      }),
      this.prisma.cursos.findMany({
        where: { deletedAt: null },
        take: 6,
        include: { terreiro: { select: { nome: true, slug: true, cidade: true, estado: true } } },
      }),
      contexto.latitude && contexto.longitude
        ? this.buscarProximos(contexto.latitude, contexto.longitude, 6)
        : Promise.resolve([]),
    ]);

    if (contexto.latitude && contexto.longitude && proximos.length > 0) {
      blocos.push({
        id: 'proximos',
        titulo: 'Terreiros Próximos',
        subtitulo: 'Encontre casas perto de você',
        tipo: 'terreiros',
        itens: proximos,
        linkVerMais: '/busca?view=mapa',
      });
    }

    if (topAvaliados.length > 0) {
      blocos.push({
        id: 'top-avaliados',
        titulo: 'Mais Bem Avaliados',
        subtitulo: 'Terreiros com as melhores avaliações da comunidade',
        tipo: 'terreiros',
        itens: topAvaliados,
        linkVerMais: '/terreiros/top',
      });
    }

    if (eventos.length > 0) {
      blocos.push({
        id: 'eventos-semana',
        titulo: 'Eventos da Semana',
        subtitulo: 'Giras, festas e encontros religiosos',
        tipo: 'eventos',
        itens: eventos.map(e => ({
          id: e.id,
          titulo: e.titulo,
          tipo: e.tipo,
          dataInicio: e.dataInicio.toISOString(),
          local: e.terreiro.cidade,
          terreiroNome: e.terreiro.nome,
          terreiroSlug: e.terreiro.slug,
          cidade: e.terreiro.cidade,
          estado: e.terreiro.estado,
        })),
        linkVerMais: '/eventos',
      });
    }

    if (cursos.length > 0) {
      blocos.push({
        id: 'cursos',
        titulo: 'Cursos Disponíveis',
        subtitulo: 'Aprenda e se aprofunde nas tradições',
        tipo: 'cursos',
        itens: cursos.map(c => ({
          id: c.id,
          titulo: c.titulo,
          modalidade: c.modalidade,
          dataInicio: c.dataInicio?.toISOString() || null,
          terreiroNome: c.terreiro.nome,
          terreiroSlug: c.terreiro.slug,
          cidade: c.terreiro.cidade,
          estado: c.terreiro.estado,
        })),
        linkVerMais: '/cursos',
      });
    }

    if (novos.length > 0) {
      blocos.push({
        id: 'novos',
        titulo: 'Novos Terreiros',
        subtitulo: 'Casas que acabaram de chegar ao AxéMap',
        tipo: 'terreiros',
        itens: this.paraRecomendacoes(novos),
        linkVerMais: '/novos-terreiros',
      });
    }

    if (verificados.length > 0) {
      blocos.push({
        id: 'verificados',
        titulo: 'Casas Verificadas',
        subtitulo: 'Perfis com verificação documental confirmada',
        tipo: 'terreiros',
        itens: this.paraRecomendacoes(verificados),
        linkVerMais: '/terreiros-verificados',
      });
    }

    return blocos;
  }

  async recomendarParaTerreiro(terreiroId: string, limite = 6): Promise<Recomendacao[]> {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { tradicao: true, latitude: true, longitude: true, cidade: true, estado: true },
    });
    if (!terreiro) return [];

    const contexto: ContextoRecomendacao = {
      latitude: terreiro.latitude,
      longitude: terreiro.longitude,
      preferencias: { tradicoesFavoritas: [terreiro.tradicao] },
    };

    const recomendacoes = await this.recomendar(contexto, limite + 1);
    return recomendacoes.filter(r => r.terreiroId !== terreiroId).slice(0, limite);
  }

  private async carregarTerreiros(contexto: ContextoRecomendacao): Promise<TerreiroParaScore[]> {
    const baseWhere = Prisma.sql`WHERE t.deleted_at IS NULL AND t.is_published = true`;

    const rows = await this.prisma.$queryRaw<TerreiroParaScore[]>`
      SELECT
        t.id, t.nome, t.slug, t.tradicao, t.trust_score as "trustScore",
        t.is_verified as "isVerified", t.cidade, t.estado,
        t.latitude, t.longitude, t.descricao_curta as "descricaoCurta",
        t.foto_url as "fotoUrl", t.updated_at as "updatedAt",
        COUNT(DISTINCT f.usuario_id) as "totalFavoritos",
        COUNT(DISTINCT a.id) as "totalAvaliacoes",
        COALESCE(AVG(a.nota), 0) as "mediaAvaliacoes",
        COUNT(DISTINCT e.id) as "totalEventos",
        COUNT(DISTINCT c.id) as "totalCursos"
      FROM terreiros t
      LEFT JOIN favoritos f ON f.terreiro_id = t.id
      LEFT JOIN avaliacoes a ON a.terreiro_id = t.id AND a.deleted_at IS NULL
      LEFT JOIN eventos e ON e.terreiro_id = t.id AND e.deleted_at IS NULL AND e.data_inicio >= NOW()
      LEFT JOIN cursos c ON c.terreiro_id = t.id AND c.deleted_at IS NULL
      ${baseWhere}
      GROUP BY t.id
      ORDER BY t.trust_score DESC
      LIMIT 200
    `;

    return (rows as unknown as TerreiroParaScore[]).map(t => ({
      ...t,
      totalFavoritos: Number(t.totalFavoritos ?? 0),
      totalAvaliacoes: Number(t.totalAvaliacoes ?? 0),
      mediaAvaliacoes: Number(t.mediaAvaliacoes ?? 0),
      totalEventos: Number(t.totalEventos ?? 0),
      totalCursos: Number(t.totalCursos ?? 0),
      trustScore: Number(t.trustScore),
    }));
  }

  private calcularScores(terreiros: TerreiroParaScore[], contexto: ContextoRecomendacao): Recomendacao[] {
    const stats = this.calcularStats(terreiros);

    return terreiros.map(t => {
      const fatores: FatorRecomendacao[] = [];
      let scoreTotal = 0;

      const addFator = (nome: string, valorNormalizado: number, peso: number) => {
        const contribuicao = valorNormalizado * peso;
        scoreTotal += contribuicao;
        fatores.push({ nome, valor: Number(valorNormalizado.toFixed(4)), contribuicao: Number(contribuicao.toFixed(4)) });
      };

      if (contexto.latitude && contexto.longitude) {
        const dist = this.calcularDistanciaKm(
          contexto.latitude, contexto.longitude,
          t.latitude, t.longitude,
        );
        t.distancia = dist;
        const distScore = Math.max(0, 1 - (dist / 100));
        addFator('Distância', distScore, this.weights.get('distancia'));
      } else {
        addFator('Distância', 0.5, this.weights.get('distancia'));
      }

      const tsScore = stats.maxTrustScore > 0 ? t.trustScore / stats.maxTrustScore : 0;
      addFator('Trust Score', tsScore, this.weights.get('trustScore'));

      const avScore = stats.maxAvaliacoes > 0
        ? ((t.mediaAvaliacoes || 0) / 5) * 0.5 + (Math.min((t.totalAvaliacoes || 0), 50) / 50) * 0.5
        : 0;
      addFator('Avaliações', avScore, this.weights.get('avaliacoes'));

      const popScore = stats.maxFavoritos > 0 ? Math.min((t.totalFavoritos || 0), stats.maxFavoritos) / stats.maxFavoritos : 0;
      addFator('Popularidade', popScore, this.weights.get('popularidade'));

      const evScore = stats.maxEventos > 0 ? Math.min((t.totalEventos || 0), stats.maxEventos) / stats.maxEventos : 0;
      addFator('Eventos Ativos', evScore, this.weights.get('eventosAtivos'));

      const curScore = stats.maxCursos > 0 ? Math.min((t.totalCursos || 0), stats.maxCursos) / stats.maxCursos : 0;
      addFator('Cursos', curScore, this.weights.get('cursos'));

      const diasDesdeUpdate = Math.max(0, (Date.now() - new Date(t.updatedAt).getTime()) / 86400000);
      const atualScore = Math.max(0, 1 - (diasDesdeUpdate / 180));
      addFator('Atualização', atualScore, this.weights.get('atualizacao'));

      if (contexto.preferencias?.tradicoesFavoritas?.length) {
        const afScore = contexto.preferencias.tradicoesFavoritas.includes(t.tradicao) ? 1 : 0;
        addFator('Afinidade', afScore, this.weights.get('afinidade'));
      } else {
        addFator('Afinidade', 0.5, this.weights.get('afinidade'));
      }

      const scoreFinal = Number((scoreTotal * 100).toFixed(2));
      const explicacao = this.gerarExplicacao(fatores, t, contexto);

      return {
        terreiroId: t.id,
        nome: t.nome,
        slug: t.slug,
        tradicao: t.tradicao,
        trustScore: t.trustScore,
        isVerified: t.isVerified,
        cidade: t.cidade,
        estado: t.estado,
        latitude: t.latitude,
        longitude: t.longitude,
        descricaoCurta: t.descricaoCurta,
        fotoUrl: t.fotoUrl,
        score: scoreFinal,
        distanciaKm: t.distancia ? Math.round(t.distancia * 10) / 10 : undefined,
        fatores,
        explicacao,
        calculadoEm: new Date().toISOString(),
      };
    });
  }

  private gerarExplicacao(fatores: FatorRecomendacao[], t: TerreiroParaScore, contexto: ContextoRecomendacao): string {
    const top = [...fatores].sort((a, b) => b.contribuicao - a.contribuicao).slice(0, 3);
    const razoes = top.map(f => {
      switch (f.nome) {
        case 'Distância': return t.distancia !== undefined
          ? `fica a ${Math.round(t.distancia)} km de você`
          : 'boa localização';
        case 'Trust Score': return `Trust Score ${t.trustScore.toFixed(1)}`;
        case 'Avaliações': return `${t.totalAvaliacoes || 0} avaliações (média ${(t.mediaAvaliacoes || 0).toFixed(1)})`;
        case 'Popularidade': return `${t.totalFavoritos || 0} favoritos`;
        case 'Eventos Ativos': return `${t.totalEventos || 0} eventos ativos`;
        case 'Cursos': return `${t.totalCursos || 0} cursos disponíveis`;
        case 'Atualização': return 'perfil recentemente atualizado';
        case 'Afinidade': return contexto.preferencias?.tradicoesFavoritas?.includes(t.tradicao)
          ? `mesma tradição (${t.tradicao})`
          : '';
        default: return '';
      }
    }).filter(Boolean);

    return `Recomendado porque ${razoes.join(', ')}.`;
  }

  private calcularStats(terreiros: TerreiroParaScore[]) {
    return {
      maxTrustScore: Math.max(...terreiros.map(t => t.trustScore), 0),
      maxFavoritos: Math.max(...terreiros.map(t => t.totalFavoritos || 0), 0),
      maxAvaliacoes: Math.max(...terreiros.map(t => t.totalAvaliacoes || 0), 0),
      maxEventos: Math.max(...terreiros.map(t => t.totalEventos || 0), 0),
      maxCursos: Math.max(...terreiros.map(t => t.totalCursos || 0), 0),
    };
  }

  private async buscarProximos(lat: number, lng: number, limite: number): Promise<Recomendacao[]> {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score as trustScore,
             is_verified as isVerified, cidade, estado,
             latitude, longitude, descricao_curta as descricaoCurta,
             foto_url as fotoUrl, updated_at as updatedAt,
             ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint(${lng}, ${lat})) as distancia
      FROM terreiros
      WHERE deleted_at IS NULL AND is_published = true
      ORDER BY distancia ASC
      LIMIT ${limite}
    `;

    return rows.map((r: any) => {
      const distKm = Number(r.distancia) / 1000;
      return {
        terreiroId: r.id,
        nome: r.nome,
        slug: r.slug,
        tradicao: r.tradicao,
        trustScore: Number(r.trustScore),
        isVerified: r.isVerified,
        cidade: r.cidade,
        estado: r.estado,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        descricaoCurta: r.descricaoCurta,
        fotoUrl: r.fotoUrl,
        score: 100 - distKm,
        distanciaKm: Math.round(distKm * 10) / 10,
        fatores: [{ nome: 'Distância', valor: 1, contribuicao: 1 }],
        explicacao: `Recomendado porque fica a ${Math.round(distKm)} km de você.`,
        calculadoEm: new Date().toISOString(),
      };
    });
  }

  private paraRecomendacoes(terreiros: TerreiroParaScore[]): Recomendacao[] {
    return terreiros.map(t => ({
      terreiroId: t.id,
      nome: t.nome,
      slug: t.slug,
      tradicao: t.tradicao,
      trustScore: t.trustScore,
      isVerified: t.isVerified,
      cidade: t.cidade,
      estado: t.estado,
      latitude: t.latitude,
      longitude: t.longitude,
      descricaoCurta: t.descricaoCurta,
      fotoUrl: t.fotoUrl,
      score: t.trustScore * 10,
      fatores: [],
      explicacao: '',
      calculadoEm: new Date().toISOString(),
    }));
  }

  private calcularDistanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2))
      * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
