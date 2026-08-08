import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventType } from '@axemap/shared';
import { PrismaService } from '../database/prisma.service';

const EVENT_TYPES = new Set(Object.values(EventType));

@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  private async verificarDirigente(usuarioId: string, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { dirigenteId: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId !== usuarioId) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar eventos');
    }
  }

  async criar(
    usuarioId: string,
    dto: {
      terreiroId: string;
      titulo: string;
      descricao?: string;
      tipo: string;
      dataInicio: string;
      dataFim?: string;
      capacidade?: number;
      isPublico?: boolean;
    },
  ) {
    if (!dto.terreiroId || !dto.titulo || !dto.tipo || !dto.dataInicio) {
      throw new BadRequestException('terreiroId, titulo, tipo e dataInicio são obrigatórios');
    }
    if (!EVENT_TYPES.has(dto.tipo as EventType)) {
      throw new BadRequestException(`Tipo de evento inválido. Use um de: ${Object.values(EventType).join(', ')}`);
    }
    const dataInicio = new Date(dto.dataInicio);
    if (Number.isNaN(dataInicio.getTime())) throw new BadRequestException('dataInicio inválida');

    await this.verificarDirigente(usuarioId, dto.terreiroId);

    return this.prisma.eventos.create({
      data: {
        terreiroId: dto.terreiroId,
        criadoPorId: usuarioId,
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        tipo: dto.tipo as EventType,
        dataInicio,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        capacidade: dto.capacidade ?? null,
        isPublico: dto.isPublico ?? true,
      },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
      },
    });
  }

  async listar(filtros: { terreiroId?: string; uf?: string; tipo?: string; limite?: number; offset?: number; passados?: boolean }) {
    const where: any = { deletedAt: null };
    if (filtros.terreiroId) where.terreiroId = filtros.terreiroId;
    if (filtros.uf) where.terreiro = { estado: filtros.uf.toUpperCase(), deletedAt: null };
    if (filtros.tipo) where.tipo = filtros.tipo.toUpperCase();
    if (!filtros.passados) where.dataInicio = { gte: new Date() };

    const [data, total] = await Promise.all([
      this.prisma.eventos.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true, tradicao: true } },
        },
        orderBy: { dataInicio: 'asc' },
        take: Math.min(filtros.limite ?? 20, 100),
        skip: filtros.offset ?? 0,
      }),
      this.prisma.eventos.count({ where }),
    ]);

    return { data, total };
  }

  async buscar(id: string) {
    const evento = await this.prisma.eventos.findFirst({
      where: { id, deletedAt: null },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true, tradicao: true } },
        presencas: { select: { id: true, status: true } },
      },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async atualizar(
    usuarioId: string,
    id: string,
    dto: {
      titulo?: string;
      descricao?: string;
      tipo?: string;
      dataInicio?: string;
      dataFim?: string;
      capacidade?: number;
      isPublico?: boolean;
    },
  ) {
    const evento = await this.buscar(id);
    await this.verificarDirigente(usuarioId, evento.terreiroId);

    if (dto.tipo && !EVENT_TYPES.has(dto.tipo as EventType)) {
      throw new BadRequestException('Tipo de evento inválido');
    }

    return this.prisma.eventos.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.tipo !== undefined ? { tipo: dto.tipo as EventType } : {}),
        ...(dto.dataInicio !== undefined ? { dataInicio: new Date(dto.dataInicio) } : {}),
        ...(dto.dataFim !== undefined ? { dataFim: dto.dataFim ? new Date(dto.dataFim) : null } : {}),
        ...(dto.capacidade !== undefined ? { capacidade: dto.capacidade } : {}),
        ...(dto.isPublico !== undefined ? { isPublico: dto.isPublico } : {}),
      },
    });
  }

  async remover(usuarioId: string, id: string) {
    const evento = await this.buscar(id);
    await this.verificarDirigente(usuarioId, evento.terreiroId);

    return this.prisma.eventos.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
