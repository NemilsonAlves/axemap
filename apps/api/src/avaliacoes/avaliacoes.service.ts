import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class AvaliacoesService {
  constructor(
    private prisma: PrismaService,
    private notificacoes: NotificacoesService,
  ) {}

  async criar(usuarioId: string, dto: { terreiroId: string; nota: number; texto?: string }) {
    if (!dto.terreiroId) throw new BadRequestException('terreiroId é obrigatório');
    if (!Number.isInteger(dto.nota) || dto.nota < 1 || dto.nota > 5) {
      throw new BadRequestException('A nota deve ser um inteiro entre 1 e 5');
    }
    if (dto.texto !== undefined && dto.texto.length > 2000) {
      throw new BadRequestException('Texto muito longo (máx. 2000 caracteres)');
    }

    const terreiro = await this.prisma.terreiros.findFirst({
      where: { id: dto.terreiroId, deletedAt: null },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const avaliacao = await this.prisma.avaliacoes.upsert({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId: dto.terreiroId } },
      create: {
        usuarioId,
        terreiroId: dto.terreiroId,
        nota: dto.nota,
        texto: dto.texto ?? null,
      },
      update: {
        nota: dto.nota,
        texto: dto.texto ?? null,
      },
      include: { resposta: true },
    });

    return avaliacao;
  }

  async listar(terreiroId?: string, limite = 20, offset = 0) {
    const where: any = { deletedAt: null };
    if (terreiroId) where.terreiroId = terreiroId;

    const [data, total] = await Promise.all([
      this.prisma.avaliacoes.findMany({
        where,
        include: {
          usuario: { select: { id: true, nome: true, avatarUrl: true } },
          resposta: true,
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.avaliacoes.count({ where }),
    ]);

    return { data, total };
  }

  async listarPorUsuario(usuarioId: string) {
    return this.prisma.avaliacoes.findMany({
      where: { usuarioId, deletedAt: null },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        resposta: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscar(id: string) {
    const avaliacao = await this.prisma.avaliacoes.findFirst({
      where: { id, deletedAt: null },
      include: {
        usuario: { select: { id: true, nome: true, avatarUrl: true } },
        terreiro: { select: { id: true, nome: true, slug: true } },
        resposta: true,
      },
    });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    return avaliacao;
  }

  async atualizar(usuarioId: string, id: string, dto: { nota?: number; texto?: string }) {
    const avaliacao = await this.buscar(id);
    if (avaliacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você só pode editar as próprias avaliações');
    }
    if (dto.nota !== undefined && (dto.nota < 1 || dto.nota > 5 || !Number.isInteger(dto.nota))) {
      throw new BadRequestException('A nota deve ser um inteiro entre 1 e 5');
    }

    return this.prisma.avaliacoes.update({
      where: { id },
      data: {
        ...(dto.nota !== undefined ? { nota: dto.nota } : {}),
        ...(dto.texto !== undefined ? { texto: dto.texto } : {}),
      },
      include: { resposta: true },
    });
  }

  async remover(usuarioId: string, id: string) {
    const avaliacao = await this.buscar(id);
    if (avaliacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Você só pode excluir as próprias avaliações');
    }

    return this.prisma.avaliacoes.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async responder(usuarioId: string, id: string, texto: string) {
    if (!texto || !texto.trim()) throw new BadRequestException('A resposta é obrigatória');
    if (texto.length > 3000) throw new BadRequestException('Resposta muito longa (máx. 3000 caracteres)');

    const avaliacao = await this.buscar(id);

      const terreiro = await this.prisma.terreiros.findUnique({
        where: { id: avaliacao.terreiroId },
        select: { dirigenteId: true, nome: true },
      });
      if (!terreiro || terreiro.dirigenteId !== usuarioId) {
        throw new ForbiddenException('Apenas o dirigente do terreiro pode responder avaliações');
      }

      await this.notificacoes.criar(avaliacao.usuarioId, {
        tipo: 'AVALIACAO_RESPONDIDA',
        titulo: 'Sua avaliação foi respondida',
        mensagem: `O dirigente de ${terreiro.nome} respondeu à sua avaliação.`,
      });

      return this.prisma.avaliacaoResposta.upsert({
      where: { avaliacaoId: id },
      create: { avaliacaoId: id, texto },
      update: { texto },
    });
  }

  async marcarUtil(usuarioId: string, id: string) {
    await this.buscar(id);
    return this.prisma.avaliacoes.update({
      where: { id },
      data: { utilCount: { increment: 1 } },
    });
  }
}
