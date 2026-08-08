import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TerreiroStatus } from '@axemap/shared';
import { PrismaService } from '../database/prisma.service';

const STATUS_VALIDOS = new Set(Object.values(TerreiroStatus));

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async painelPendentes() {
    const [reivindicacoes, terreirosEmRevisao] = await Promise.all([
      this.prisma.claimRequest.findMany({
        where: { status: 'PENDENTE' },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.terreiros.findMany({
        where: { deletedAt: null, status: { in: ['PENDENTE_REVISAO', 'EM_REVISAO', 'RASCUNHO'] } },
        select: { id: true, nome: true, slug: true, cidade: true, estado: true, status: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return { reivindicacoes, terreirosEmRevisao };
  }

  async listarTerreiros(status?: string, q?: string, limite = 50, offset = 0) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { cidade: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.terreiros.findMany({
        where,
        select: {
          id: true, nome: true, slug: true, cidade: true, estado: true, status: true,
          trustScore: true, isPublished: true, isVerified: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.terreiros.count({ where }),
    ]);

    return { data, total };
  }

  async atualizarStatus(id: string, status: string) {
    if (!STATUS_VALIDOS.has(status as TerreiroStatus)) {
      throw new BadRequestException(`Status inválido. Use um de: ${Object.values(TerreiroStatus).join(', ')}`);
    }

    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    return this.prisma.terreiros.update({
      where: { id },
      data: {
        status: status as TerreiroStatus,
        isPublished: status === 'PUBLICADO' || status === 'VERIFICADO',
      },
    });
  }
}
