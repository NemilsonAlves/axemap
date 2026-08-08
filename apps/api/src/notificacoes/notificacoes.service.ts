import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  async criar(usuarioId: string, dto: { tipo: string; titulo: string; mensagem?: string }) {
    if (!dto.tipo || !dto.titulo) {
      throw new BadRequestException('tipo e titulo são obrigatórios');
    }
    return this.prisma.notificacoes.create({
      data: {
        usuarioId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensagem: dto.mensagem ?? null,
      },
    });
  }

  async listar(usuarioId: string, naoLidas = false, limite = 50, offset = 0) {
    const where: any = { usuarioId };
    if (naoLidas) where.lida = false;

    const [data, total] = await Promise.all([
      this.prisma.notificacoes.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.notificacoes.count({ where }),
    ]);

    return { data, total };
  }

  async contarNaoLidas(usuarioId: string) {
    const total = await this.prisma.notificacoes.count({ where: { usuarioId, lida: false } });
    return { total };
  }

  async marcarLida(usuarioId: string, id: string) {
    const notificacao = await this.prisma.notificacoes.findFirst({
      where: { id, usuarioId },
    });
    if (!notificacao) {
      throw new BadRequestException('Notificação não encontrada');
    }
    return this.prisma.notificacoes.update({ where: { id }, data: { lida: true } });
  }

  async marcarTodasLidas(usuarioId: string) {
    const result = await this.prisma.notificacoes.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });
    return { atualizadas: result.count };
  }
}
