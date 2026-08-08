import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  async topTrustScore(limite = 20) {
    const terreiros = await this.prisma.terreiros.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { trustScore: 'desc' },
      take: limite,
      select: {
        id: true, nome: true, slug: true, tradicao: true,
        trustScore: true, isVerified: true,
        cidade: true, estado: true,
        descricaoCurta: true, fotoUrl: true,
        _count: { select: { avaliacoes: true, favoritos: true, eventos: true, cursos: true } },
      },
    });

    return terreiros.map((t, i) => ({
      posicao: i + 1,
      id: t.id, nome: t.nome, slug: t.slug,
      tradicao: t.tradicao,
      trustScore: t.trustScore,
      isVerified: t.isVerified,
      cidade: t.cidade, estado: t.estado,
      descricaoCurta: t.descricaoCurta,
      fotoUrl: t.fotoUrl,
      totalAvaliacoes: t._count.avaliacoes,
      totalFavoritos: t._count.favoritos,
      razao: `Trust Score de ${t.trustScore.toFixed(1)} — o mais alto entre todos os terreiros cadastrados.`,
    }));
  }

  async maisFavoritados(limite = 20) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT t.id, t.nome, t.slug, t.tradicao, t.trust_score,
             t.is_verified, t.cidade, t.estado,
             t.descricao_curta, t.foto_url,
             COUNT(f.usuario_id) as total_favoritos
      FROM terreiros t
      LEFT JOIN favoritos f ON f.terreiro_id = t.id
      WHERE t.deleted_at IS NULL AND t.is_published = true
      GROUP BY t.id
      ORDER BY total_favoritos DESC
      LIMIT ${limite}
    `;

    return rows.map((t, i: number) => ({
      posicao: i + 1,
      id: t.id, nome: t.nome, slug: t.slug,
      tradicao: t.tradicao,
      trustScore: Number(t.trust_score),
      isVerified: t.is_verified,
      cidade: t.cidade, estado: t.estado,
      descricaoCurta: t.descricao_curta,
      fotoUrl: t.foto_url,
      totalFavoritos: Number(t.total_favoritos),
      razao: `${Number(t.total_favoritos)} favorito${Number(t.total_favoritos) !== 1 ? 's' : ''} — o mais querido pela comunidade.`,
    }));
  }

  async maisAvaliados(limite = 20) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT t.id, t.nome, t.slug, t.tradicao, t.trust_score,
             t.is_verified, t.cidade, t.estado,
             t.descricao_curta, t.foto_url,
             COUNT(a.id) as total_avaliacoes,
             ROUND(AVG(a.nota)::numeric, 1) as media_nota
      FROM terreiros t
      LEFT JOIN avaliacoes a ON a.terreiro_id = t.id AND a.deleted_at IS NULL
      WHERE t.deleted_at IS NULL AND t.is_published = true
      GROUP BY t.id
      HAVING COUNT(a.id) >= 3
      ORDER BY media_nota DESC, total_avaliacoes DESC
      LIMIT ${limite}
    `;

    return rows.map((t, i: number) => ({
      posicao: i + 1,
      id: t.id, nome: t.nome, slug: t.slug,
      tradicao: t.tradicao,
      trustScore: Number(t.trust_score),
      isVerified: t.is_verified,
      cidade: t.cidade, estado: t.estado,
      descricaoCurta: t.descricao_curta,
      fotoUrl: t.foto_url,
      totalAvaliacoes: Number(t.total_avaliacoes),
      mediaNota: Number(t.media_nota),
      razao: `Média ${t.media_nota} em ${t.total_avaliacoes} avaliações — aprovado pela comunidade.`,
    }));
  }

  async maiorCrescimento(limite = 20) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT t.id, t.nome, t.slug, t.tradicao, t.trust_score,
             t.is_verified, t.cidade, t.estado,
             t.descricao_curta, t.foto_url, t.publicado_em,
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
      HAVING COUNT(DISTINCT f.usuario_id) + COUNT(DISTINCT a.id) > 0
      ORDER BY total_favoritos DESC, total_avaliacoes DESC
      LIMIT ${limite}
    `;

    return rows.map((t, i: number) => ({
      posicao: i + 1,
      id: t.id, nome: t.nome, slug: t.slug,
      tradicao: t.tradicao,
      trustScore: Number(t.trust_score),
      isVerified: t.is_verified,
      cidade: t.cidade, estado: t.estado,
      descricaoCurta: t.descricao_curta,
      fotoUrl: t.foto_url,
      totalFavoritos: Number(t.total_favoritos),
      totalAvaliacoes: Number(t.total_avaliacoes),
      publicadoEm: t.publicado_em,
      razao: `${Number(t.total_favoritos)} novo${Number(t.total_favoritos) !== 1 ? 's' : ''} favorito${Number(t.total_favoritos) !== 1 ? 's' : ''} e ${Number(t.total_avaliacoes)} nova${Number(t.total_avaliacoes) !== 1 ? 's' : ''} avaliação${Number(t.total_avaliacoes) !== 1 ? 's' : ''} nos últimos 30 dias.`,
    }));
  }

  async melhoresEventos() {
    const eventos: any[] = await this.prisma.$queryRaw`
      SELECT e.id, e.titulo, e.tipo, e.data_inicio, e.data_fim,
             e.capacidade,
             t.nome as terreiro_nome, t.slug as terreiro_slug,
             t.cidade, t.estado, t.tradicao,
             COUNT(p.id) as total_presencas,
             t.trust_score
      FROM eventos e
      JOIN terreiros t ON t.id = e.terreiro_id
      LEFT JOIN presenca_eventos p ON p.evento_id = e.id
      WHERE e.deleted_at IS NULL
        AND e.data_inicio >= NOW()
        AND t.deleted_at IS NULL AND t.is_published = true
      GROUP BY e.id, t.nome, t.slug, t.cidade, t.estado, t.tradicao, t.trust_score
      ORDER BY total_presencas DESC, t.trust_score DESC
      LIMIT 10
    `;

    return eventos.map(e => ({
      id: e.id,
      titulo: e.titulo,
      tipo: e.tipo,
      dataInicio: e.data_inicio,
      dataFim: e.data_fim,
      capacidade: e.capacidade,
      terreiroNome: e.terreiro_nome,
      terreiroSlug: e.terreiro_slug,
      cidade: e.cidade,
      estado: e.estado,
      tradicao: e.tradicao,
      totalPresencas: Number(e.total_presencas),
    }));
  }

  async melhoresCursos() {
    const cursos: any[] = await this.prisma.$queryRaw`
      SELECT c.id, c.titulo, c.modalidade, c.carga_horaria,
             c.data_inicio, c.vagas,
             t.nome as terreiro_nome, t.slug as terreiro_slug,
             t.cidade, t.estado, t.tradicao, t.trust_score,
             COUNT(m.id) as total_matriculas
      FROM cursos c
      JOIN terreiros t ON t.id = c.terreiro_id
      LEFT JOIN matriculas_curso m ON m.curso_id = c.id
      WHERE c.deleted_at IS NULL
        AND t.deleted_at IS NULL AND t.is_published = true
      GROUP BY c.id, t.nome, t.slug, t.cidade, t.estado, t.tradicao, t.trust_score
      ORDER BY total_matriculas DESC, t.trust_score DESC
      LIMIT 10
    `;

    return cursos.map(c => ({
      id: c.id,
      titulo: c.titulo,
      modalidade: c.modalidade,
      cargaHoraria: c.carga_horaria,
      dataInicio: c.data_inicio,
      vagas: c.vagas,
      terreiroNome: c.terreiro_nome,
      terreiroSlug: c.terreiro_slug,
      cidade: c.cidade,
      estado: c.estado,
      tradicao: c.tradicao,
      totalMatriculas: Number(c.total_matriculas),
    }));
  }
}
