import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RecommendationEngine } from '../recommendation/recommendation-engine.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private prisma: PrismaService,
    private engine: RecommendationEngine,
  ) {}

  async trending(limite = 20) {
    const terreiros: any[] = await this.prisma.$queryRaw`
      SELECT
        t.id, t.nome, t.slug, t.tradicao, t.trust_score,
        t.is_verified, t.cidade, t.estado, t.latitude, t.longitude,
        t.descricao_curta, t.foto_url,
        COUNT(DISTINCT f.usuario_id) as total_favoritos,
        COUNT(DISTINCT a.id) as total_avaliacoes
      FROM terreiros t
      LEFT JOIN favoritos f ON f.terreiro_id = t.id
        AND f.created_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN avaliacoes a ON a.terreiro_id = t.id
        AND a.created_at >= NOW() - INTERVAL '30 days'
        AND a.deleted_at IS NULL
      WHERE t.deleted_at IS NULL AND t.is_published = true
      GROUP BY t.id
      ORDER BY total_favoritos DESC, total_avaliacoes DESC
      LIMIT ${limite}
    `;

    return terreiros.map(t => ({
      id: t.id, nome: t.nome, slug: t.slug,
      tradicao: t.tradicao,
      trustScore: Number(t.trust_score),
      isVerified: t.is_verified,
      cidade: t.cidade, estado: t.estado,
      descricaoCurta: t.descricao_curta,
      fotoUrl: t.foto_url,
      totalFavoritos: Number(t.total_favoritos),
      totalAvaliacoes: Number(t.total_avaliacoes),
      score: Number(t.total_favoritos) * 2 + Number(t.total_avaliacoes),
    }));
  }

  async eventosEmAlta(limite = 10) {
    const eventos: any[] = await this.prisma.$queryRaw`
      SELECT e.id, e.titulo, e.tipo, e.data_inicio,
             t.nome as terreiro_nome, t.slug as terreiro_slug,
             t.cidade, t.estado,
             COUNT(p.id) as total_presencas
      FROM eventos e
      JOIN terreiros t ON t.id = e.terreiro_id
      LEFT JOIN presenca_eventos p ON p.evento_id = e.id
      WHERE e.deleted_at IS NULL
        AND e.data_inicio >= NOW()
        AND t.deleted_at IS NULL AND t.is_published = true
      GROUP BY e.id, t.nome, t.slug, t.cidade, t.estado
      ORDER BY total_presencas DESC, e.data_inicio ASC
      LIMIT ${limite}
    `;

    return eventos.map(e => ({
      id: e.id,
      titulo: e.titulo,
      tipo: e.tipo,
      dataInicio: e.data_inicio,
      terreiroNome: e.terreiro_nome,
      terreiroSlug: e.terreiro_slug,
      cidade: e.cidade,
      estado: e.estado,
      totalPresencas: Number(e.total_presencas),
    }));
  }

  async explore(lat?: number, lng?: number) {
    const [tradicoes, cidades, stats] = await Promise.all([
      this.prisma.$queryRaw<Array<{ tradicao: string; count: bigint }>>`
        SELECT tradicao, COUNT(*) as count FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true
        GROUP BY tradicao ORDER BY count DESC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; estado: string; count: bigint }>>`
        SELECT cidade, estado, COUNT(*) as count FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true
        GROUP BY cidade, estado ORDER BY count DESC LIMIT 20
      `,
      {
        totalTerreiro: await this.prisma.terreiros.count({ where: { deletedAt: null, isPublished: true } }),
        totalVerificados: await this.prisma.terreiros.count({ where: { isVerified: true, deletedAt: null, isPublished: true } }),
        totalEventos: await this.prisma.eventos.count({ where: { deletedAt: null, dataInicio: { gte: new Date() } } }),
      },
    ]);

    const engineResult = lat && lng
      ? await this.engine.recomendar({ latitude: lat, longitude: lng }, 12)
      : [];

    return {
      capa: engineResult.slice(0, 6),
      tradicoes: tradicoes.map(t => ({ nome: t.tradicao, count: Number(t.count) })),
      cidades: cidades.map(c => ({ cidade: c.cidade, estado: c.estado, count: Number(c.count) })),
      stats,
    };
  }
}
