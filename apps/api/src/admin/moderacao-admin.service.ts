import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ModerationAdminService {
  constructor(private prisma: PrismaService) {}

  async listarEventos(q?: string, arquivados?: string, limite = 50, offset = 0) {
    const where: any = {
      ...(arquivados === 'true'
        ? { deletedAt: { not: null } }
        : { deletedAt: null }),
    };
    if (q) where.titulo = { contains: q, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.eventos.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        },
        orderBy: { dataInicio: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.eventos.count({ where }),
    ]);

    return { data, total };
  }

  async arquivarEvento(id: string) {
    const evento = await this.prisma.eventos.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (evento.deletedAt) throw new BadRequestException('Evento já arquivado');
    return this.prisma.eventos.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restaurarEvento(id: string) {
    const evento = await this.prisma.eventos.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    if (!evento.deletedAt) throw new BadRequestException('Evento não está arquivado');
    return this.prisma.eventos.update({ where: { id }, data: { deletedAt: null } });
  }

  async listarOrganizacoes(q?: string, status?: string, limite = 50, offset = 0) {
    const where: any = { deletedAt: null };
    if (q) where.nome = { contains: q, mode: 'insensitive' };
    if (status === 'PUBLICADA') where.isPublished = true;
    if (status === 'RASCUNHO') where.isPublished = false;

    const [data, total] = await Promise.all([
      this.prisma.organizacoes.findMany({
        where,
        include: { criadoPor: { select: { id: true, nome: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.organizacoes.count({ where }),
    ]);

    return { data, total };
  }

  async publicarOrganizacao(id: string) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (org.deletedAt) throw new BadRequestException('Organização arquivada');
    return this.prisma.organizacoes.update({
      where: { id },
      data: { isPublished: true, publicadoEm: org.publicadoEm ?? new Date() },
    });
  }

  async arquivarOrganizacao(id: string) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (org.deletedAt) throw new BadRequestException('Organização já arquivada');
    return this.prisma.organizacoes.update({
      where: { id },
      data: { isPublished: false, deletedAt: new Date() },
    });
  }

  async definirVerificacaoOrganizacao(id: string, nivel: string) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (org.deletedAt) throw new BadRequestException('Organização arquivada');

    const validos = [
      'NAO_VERIFICADA',
      'REIVINDICADA',
      'VERIFICADA',
      'ORGANIZACAO_VERIFICADA',
      'PARCEIRO_INSTITUCIONAL',
    ];
    if (!validos.includes(nivel)) {
      throw new BadRequestException('Nível de verificação inválido');
    }

    return this.prisma.organizacoes.update({
      where: { id },
      data: { verificacao: nivel as any },
    });
  }

  async listarAvaliacoes(q?: string, minNota?: string, ocultas?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (ocultas === 'true') {
      where.deletedAt = { not: null };
    } else if (ocultas !== 'false') {
      where.deletedAt = null;
    }
    if (minNota) where.nota = { gte: parseInt(minNota) };

    const [data, total] = await Promise.all([
      this.prisma.avaliacoes.findMany({
        where,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          terreiro: { select: { id: true, nome: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.avaliacoes.count({ where }),
    ]);

    return { data, total };
  }

  async ocultarAvaliacao(id: string) {
    const avaliacao = await this.prisma.avaliacoes.findUnique({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    if (avaliacao.deletedAt) throw new BadRequestException('Avaliação já oculta');
    return this.prisma.avaliacoes.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restaurarAvaliacao(id: string) {
    const avaliacao = await this.prisma.avaliacoes.findUnique({ where: { id } });
    if (!avaliacao) throw new NotFoundException('Avaliação não encontrada');
    if (!avaliacao.deletedAt) throw new BadRequestException('Avaliação não está oculta');
    return this.prisma.avaliacoes.update({ where: { id }, data: { deletedAt: null } });
  }
}
