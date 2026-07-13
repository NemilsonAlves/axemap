import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async buscarPorRaio(lat: number, lng: number, raioKm: number) {
    const raioMeters = raioKm * 1000;
    return this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score, cidade, estado,
             latitude, longitude,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude)::geography,
               ST_MakePoint(${lng}, ${lat})::geography
             ) as distancia
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
        AND ST_DWithin(
              ST_MakePoint(longitude, latitude)::geography,
              ST_MakePoint(${lng}, ${lat})::geography,
              ${raioMeters}
            )
      ORDER BY distancia ASC
      LIMIT 50
    `;
  }

  async buscarPorBoundingBox(norte: number, sul: number, leste: number, oeste: number) {
    return this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score,
             latitude, longitude
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
        AND latitude BETWEEN ${sul} AND ${norte}
        AND longitude BETWEEN ${oeste} AND ${leste}
      ORDER BY trust_score DESC
    `;
  }

  async buscarProximos(lat: number, lng: number, limite = 10) {
    return this.prisma.$queryRaw`
      SELECT id, nome, slug, tradicao, trust_score, cidade, estado,
             latitude, longitude,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude)::geography,
               ST_MakePoint(${lng}, ${lat})::geography
             ) as distancia
      FROM terreiros
      WHERE deleted_at IS NULL
        AND is_published = true
      ORDER BY ST_MakePoint(longitude, latitude)::geography <-> ST_MakePoint(${lng}, ${lat})::geography
      LIMIT ${limite}
    `;
  }

  async contarPorCidade() {
    return this.prisma.$queryRaw`
      SELECT cidade, estado, COUNT(*) as total,
             ROUND(AVG(trust_score)::numeric, 1) as media_trust
      FROM terreiros
      WHERE deleted_at IS NULL AND is_published = true
      GROUP BY cidade, estado
      ORDER BY total DESC
    `;
  }
}
