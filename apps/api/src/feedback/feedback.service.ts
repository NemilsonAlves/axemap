import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: { tipo: string; mensagem: string; pagina?: string; contato?: string }, usuarioId?: string) {
    return this.prisma.feedback.create({ data: { ...dto, usuarioId } });
  }

  async listar(limit = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit, skip: offset,
        include: { usuario: { select: { id: true, nome: true, email: true } } },
      }),
      this.prisma.feedback.count(),
    ]);
    return { data, total };
  }
}
