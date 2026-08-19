import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { mascararLocalizacao } from '../common/utils/location-visibility';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  private mascarar(rows: any[]) {
    return rows.map((r) => {
      const comVisibilidade = { ...r, visibilidadeLocalizacao: (r as any).visibilidade_localizacao ?? 'PUBLICO' };
      return mascararLocalizacao(comVisibilidade);
    });
  }

  async buscarPorRaio(lat: number, lng: number, raioKm: number) {
    const raioMeters = raioKm * 1000;
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score, cidade, estado,
             latitude, longitude, visibilidade_localizacao,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint(${lng}, ${lat})
             ) as distancia
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
        AND nivel_privacidade = 'PUBLICO'
        AND visibilidade_localizacao != 'PRIVADA'
        AND ST_DWithin(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(${lng}, ${lat})::geography,
              ${raioMeters}
            )
      ORDER BY distancia ASC
      LIMIT 50
    `;
    return this.mascarar(rows);
  }

  async buscarPorBoundingBox(norte: number, sul: number, leste: number, oeste: number) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score,
             latitude, longitude, visibilidade_localizacao
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
        AND nivel_privacidade = 'PUBLICO'
        AND visibilidade_localizacao != 'PRIVADA'
        AND latitude BETWEEN ${sul} AND ${norte}
        AND longitude BETWEEN ${oeste} AND ${leste}
      ORDER BY trust_score DESC
    `;
    return this.mascarar(rows);
  }

  async buscarProximos(lat: number, lng: number, limite = 10) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score, cidade, estado,
             latitude, longitude, visibilidade_localizacao,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint(${lng}, ${lat})
             ) as distancia
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
        AND nivel_privacidade = 'PUBLICO'
        AND visibilidade_localizacao != 'PRIVADA'
      ORDER BY ST_MakePoint(longitude, latitude) <-> ST_MakePoint(${lng}, ${lat})
      LIMIT ${limite}
    `;
    return this.mascarar(rows);
  }

  async contarPorCidade() {
    const rows = await this.prisma.$queryRaw<Array<{ cidade: string; estado: string; total: bigint; media_trust: number }>>`
      SELECT cidade, estado, COUNT(*) as total,
             ROUND(AVG(trust_score)::numeric, 1) as media_trust
      FROM terreiros
      WHERE deleted_at IS NULL AND is_published = true AND nivel_privacidade = 'PUBLICO'
      GROUP BY cidade, estado
      ORDER BY total DESC
    `;
    return rows.map(r => ({ cidade: r.cidade, estado: r.estado, total: Number(r.total), media_trust: Number(r.media_trust) }));
  }
}
