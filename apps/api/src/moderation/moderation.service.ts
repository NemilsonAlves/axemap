import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

const TIPOS_VALIDOS = new Set(['TERREIRO', 'EVENTO', 'CURSO', 'CONTEUDO', 'USUARIO']);

@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private notificacoes: NotificacoesService,
  ) {}

  async denunciar(usuarioId: string, dto: {
    motivo: string; tipo?: string; entidadeId: string; terreiroId?: string; descricao?: string;
  }) {
    if (!dto.motivo || !dto.entidadeId) {
      throw new BadRequestException('motivo e entidadeId são obrigatórios');
    }
    if (dto.tipo && !TIPOS_VALIDOS.has(dto.tipo.toUpperCase())) {
      throw new BadRequestException(`tipo inválido. Use um de: ${[...TIPOS_VALIDOS].join(', ')}`);
    }

    return this.prisma.denuncias.create({
      data: {
        criadoPorId: usuarioId,
        motivo: dto.motivo,
        descricao: dto.descricao ?? null,
        tipo: (dto.tipo || 'TERREIRO').toUpperCase(),
        entidadeId: dto.entidadeId,
        terreiroId: dto.terreiroId ?? null,
      },
    });
  }

  async listar(status?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (status) where.status = status.toUpperCase();

    const [data, total] = await Promise.all([
      this.prisma.denuncias.findMany({
        where,
        include: {
          criadoPor: { select: { id: true, nome: true, email: true } },
          revisadoPor: { select: { id: true, nome: true } },
          terreiro: { select: { id: true, nome: true, slug: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.denuncias.count({ where }),
    ]);

    return { data, total };
  }

  async resolver(denunciaId: string, revisorId: string, bloquearTerreiro = false) {
    const denuncia = await this.prisma.denuncias.findUnique({ where: { id: denunciaId } });
    if (!denuncia) throw new NotFoundException('Denúncia não encontrada');

    await this.prisma.denuncias.update({
      where: { id: denunciaId },
      data: { status: 'RESOLVIDA', revisadoPorId: revisorId, resolvidoEm: new Date() },
    });

      if (bloquearTerreiro && denuncia.terreiroId) {
        await this.prisma.terreiros.update({
          where: { id: denuncia.terreiroId },
          data: { status: 'BLOQUEADO', isPublished: false },
        });
        const terreiro = await this.prisma.terreiros.findUnique({
          where: { id: denuncia.terreiroId },
          select: { dirigenteId: true, nome: true },
        });
        if (terreiro?.dirigenteId) {
          await this.notificacoes.criar(terreiro.dirigenteId, {
            tipo: 'TERREIRO_BLOQUEADO',
            titulo: 'Seu terreiro foi bloqueado',
            mensagem: `O terreiro ${terreiro.nome} foi bloqueado após análise de uma denúncia.`,
          });
        }
      }

      await this.notificacoes.criar(denuncia.criadoPorId, {
        tipo: 'DENUNCIA_RESOLVIDA',
        titulo: 'Sua denúncia foi analisada',
        mensagem: bloquearTerreiro
          ? 'A denúncia foi confirmada e as medidas cabíveis foram tomadas.'
          : 'A denúncia foi analisada. Agradecemos sua contribuição.',
      });

      return { id: denunciaId, status: 'RESOLVIDA', bloqueado: bloquearTerreiro && !!denuncia.terreiroId };
  }
}
