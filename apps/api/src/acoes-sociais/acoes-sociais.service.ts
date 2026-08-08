import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AcoesSociaisService {
  constructor(private prisma: PrismaService) {}

  private async verificarDirigente(usuarioId: string, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { dirigenteId: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId !== usuarioId) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar ações sociais');
    }
  }

  async criar(usuarioId: string, dto: {
    terreiroId: string; nome: string; descricao?: string; tipo?: string; data?: string; alcance?: number;
  }) {
    if (!dto.terreiroId || !dto.nome) {
      throw new BadRequestException('terreiroId e nome são obrigatórios');
    }
    await this.verificarDirigente(usuarioId, dto.terreiroId);

    return this.prisma.acoesSociais.create({
      data: {
        terreiroId: dto.terreiroId,
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        tipo: dto.tipo ?? null,
        data: dto.data ? new Date(dto.data) : null,
        alcance: dto.alcance ?? null,
      },
      include: { terreiro: { select: { id: true, nome: true, slug: true } } },
    });
  }

  async listar(terreiroId?: string, limite = 20, offset = 0) {
    const where: any = { deletedAt: null };
    if (terreiroId) where.terreiroId = terreiroId;

    const [data, total] = await Promise.all([
      this.prisma.acoesSociais.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.acoesSociais.count({ where }),
    ]);

    return { data, total };
  }

  async buscar(id: string) {
    const acao = await this.prisma.acoesSociais.findFirst({
      where: { id, deletedAt: null },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
      },
    });
    if (!acao) throw new NotFoundException('Ação social não encontrada');
    return acao;
  }

  async atualizar(usuarioId: string, id: string, dto: {
    nome?: string; descricao?: string; tipo?: string; data?: string; alcance?: number;
  }) {
    const acao = await this.buscar(id);
    await this.verificarDirigente(usuarioId, acao.terreiroId);

    return this.prisma.acoesSociais.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.tipo !== undefined ? { tipo: dto.tipo } : {}),
        ...(dto.data !== undefined ? { data: dto.data ? new Date(dto.data) : null } : {}),
        ...(dto.alcance !== undefined ? { alcance: dto.alcance } : {}),
      },
    });
  }

  async remover(usuarioId: string, id: string) {
    const acao = await this.buscar(id);
    await this.verificarDirigente(usuarioId, acao.terreiroId);
    return this.prisma.acoesSociais.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
