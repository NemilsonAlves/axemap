import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async registrar(usuarioId: string | null, acao: string, entidadeTipo: string, entidadeId: string, dados?: {
    antes?: any; depois?: any; ip?: string; userAgent?: string;
  }) {
    return this.prisma.auditLogs.create({
      data: {
        usuarioId,
        acao,
        entidadeTipo,
        entidadeId,
        antes: dados?.antes ?? undefined,
        depois: dados?.depois ?? undefined,
        ip: dados?.ip ?? undefined,
        userAgent: dados?.userAgent ?? undefined,
      },
    });
  }

  async listar(entidadeTipo?: string, entidadeId?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (entidadeTipo) where.entidadeTipo = entidadeTipo;
    if (entidadeId) where.entidadeId = entidadeId;

    const [data, total] = await Promise.all([
      this.prisma.auditLogs.findMany({
        where,
        include: { usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.auditLogs.count({ where }),
    ]);

    return { data, total };
  }
}
