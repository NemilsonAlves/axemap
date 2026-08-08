import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    return this.prisma.featureFlag.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async criar(dto: { chave: string; titulo: string; descricao?: string; ativo?: boolean; regras?: any }) {
    return this.prisma.featureFlag.create({
      data: {
        chave: dto.chave,
        titulo: dto.titulo,
        descricao: dto.descricao,
        ativo: dto.ativo ?? false,
        regras: dto.regras || {},
      },
    });
  }

  async atualizar(id: string, dto: { ativo?: boolean; titulo?: string; descricao?: string; regras?: any }) {
    return this.prisma.featureFlag.update({ where: { id }, data: dto });
  }

  async isActive(chave: string, context?: { usuarioId?: string; cidade?: string; estado?: string }) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { chave } });
    if (!flag) return false;
    if (!flag.ativo) return false;

    if (context?.usuarioId) {
      const override = await this.prisma.featureFlagOverride.findFirst({
        where: { flagId: flag.id, usuarioId: context.usuarioId },
      });
      if (override) return override.ativo;
    }

    const rules = (flag.regras as any) || {};
    if (rules.cidades && context?.cidade && rules.cidades.includes(context.cidade)) return true;
    if (rules.estados && context?.estado && rules.estados.includes(context.estado)) return true;

    return flag.ativo;
  }

  async setOverride(dto: {
    flagId: string; ativo: boolean;
    usuarioId?: string; terreiroId?: string;
    cidade?: string; estado?: string;
  }) {
    const existing = await this.prisma.featureFlagOverride.findFirst({
      where: {
        flagId: dto.flagId,
        ...(dto.usuarioId ? { usuarioId: dto.usuarioId } : {}),
        ...(dto.cidade ? { cidade: dto.cidade } : {}),
        ...(dto.estado ? { estado: dto.estado } : {}),
      },
    });
    if (existing) {
      return this.prisma.featureFlagOverride.update({
        where: { id: existing.id },
        data: { ativo: dto.ativo },
      });
    }
    return this.prisma.featureFlagOverride.create({ data: dto });
  }

  async getFlagsStatus(context: { usuarioId?: string; cidade?: string; estado?: string }) {
    const flags = await this.prisma.featureFlag.findMany();
    const result: Record<string, boolean> = {};
    for (const flag of flags) {
      result[flag.chave] = await this.isActive(flag.chave, context);
    }
    return result;
  }
}
