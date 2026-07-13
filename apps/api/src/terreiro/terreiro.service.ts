import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TerreiroService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: any, usuarioId: string) {
    const slug = dto.nome
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.terreiros.create({
      data: {
        nome: dto.nome,
        slug,
        tradicao: dto.tradicao,
        descricaoCurta: dto.descricaoCurta,
        cidade: dto.cidade,
        estado: dto.estado,
        latitude: dto.latitude,
        longitude: dto.longitude,
        telefone: dto.telefone,
        email: dto.email,
        criadoPorId: usuarioId,
        dirigenteId: usuarioId,
      },
    });
  }

  async listar(filters: {
    cidade?: string;
    estado?: string;
    tradicao?: string;
    q?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {
      deletedAt: null,
      isPublished: true,
    };

    if (filters.cidade) where.cidade = filters.cidade;
    if (filters.estado) where.estado = filters.estado;
    if (filters.tradicao) where.tradicao = filters.tradicao;
    if (filters.q) {
      where.OR = [
        { nome: { contains: filters.q, mode: 'insensitive' } },
        { descricaoCurta: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.terreiros.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      this.prisma.terreiros.count({ where }),
    ]);

    return { data, total, limit: filters.limit, offset: filters.offset };
  }

  async buscarPorSlug(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { slug },
      include: {
        avaliacoes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        eventos: {
          where: { deletedAt: null, dataInicio: { gte: new Date() } },
          orderBy: { dataInicio: 'asc' },
          take: 5,
        },
      },
    });

    if (!terreiro || terreiro.deletedAt) {
      throw new NotFoundException('Terreiro não encontrado');
    }

    return terreiro;
  }

  async atualizar(id: string, dto: any, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    return this.prisma.terreiros.update({
      where: { id },
      data: dto,
    });
  }

  async deletar(id: string, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    await this.prisma.terreiros.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
