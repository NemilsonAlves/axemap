import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { EpisodioStatus, SubmeterEpisodioDto } from './tv.types';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

/**
 * TvService — módulo de mídia cultural da TV AxéMap.
 *
 * Fluxo: submeter → AGUARDANDO_REVISAO → EM_REVISAO → APROVADO → PUBLICADO.
 * Conteúdo só fica visível ao público com status PUBLICADO.
 */
@Injectable()
export class TvService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // PÚBLICO — listagem de episódios publicados
  // ──────────────────────────────────────────────────────────────

  async listarPublicados(tipo?: string, tradicao?: string, limit = 20, offset = 0) {
    const where: any = {
      status: EpisodioStatus.PUBLICADO,
      deletedAt: null,
    };
    if (tipo) where.tipo = tipo;
    if (tradicao) where.tradicao = tradicao;

    const [data, total] = await Promise.all([
      this.prisma.episodioTV.findMany({
        where,
        orderBy: { publicadoEm: 'desc' },
        take: Math.min(limit, 50),
        skip: offset,
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          tipo: true,
          youtubeId: true,
          videoUrl: true,
          thumbnailUrl: true,
          duracao: true,
          tags: true,
          tradicao: true,
          visualizacoes: true,
          publicadoEm: true,
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        },
      }),
      this.prisma.episodioTV.count({ where }),
    ]);
    return { data, total };
  }

  async obterPorSlug(slug: string) {
    const ep = await this.prisma.episodioTV.findFirst({
      where: { slug, status: EpisodioStatus.PUBLICADO, deletedAt: null },
      include: { terreiro: { select: { id: true, nome: true, slug: true } } },
    });
    if (!ep) throw new NotFoundException('Episódio não encontrado');
    // Incrementar visualizações (fire-and-forget)
    this.prisma.episodioTV
      .update({ where: { id: ep.id }, data: { visualizacoes: { increment: 1 } } })
      .catch(() => undefined);
    return ep;
  }

  // ──────────────────────────────────────────────────────────────
  // COMUNIDADE — submissão de conteúdo
  // ──────────────────────────────────────────────────────────────

  async submeter(dto: SubmeterEpisodioDto, usuarioId: string) {
    if (!dto.titulo?.trim()) throw new BadRequestException('titulo é obrigatório');
    if (!dto.youtubeId && !dto.videoUrl) {
      throw new BadRequestException('Informe youtubeId ou videoUrl');
    }

    const baseSlug = slugify(dto.titulo);
    // Garante unicidade do slug
    const existing = await this.prisma.episodioTV.findMany({
      where: { slug: { startsWith: baseSlug }, deletedAt: null },
      select: { slug: true },
    });
    const slugs = new Set(existing.map((e) => e.slug));
    let slug = baseSlug;
    let attempt = 1;
    while (slugs.has(slug)) {
      slug = `${baseSlug}-${attempt++}`;
    }

    const ep = await this.prisma.episodioTV.create({
      data: {
        titulo: dto.titulo,
        slug,
        descricao: dto.descricao ?? null,
        tipo: (dto.tipo as any) ?? 'DOCUMENTARIO',
        status: EpisodioStatus.AGUARDANDO_REVISAO,
        youtubeId: dto.youtubeId ?? null,
        videoUrl: dto.videoUrl ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        duracao: dto.duracao ?? null,
        tags: dto.tags ?? [],
        tradicao: dto.tradicao ?? null,
        terreiroId: dto.terreiroId ?? null,
        submitorId: usuarioId,
      },
    });

    await this.auditLogs.registrar(usuarioId, 'TV_EPISODIO_SUBMETIDO', 'EPISODIO_TV', ep.id, {
      depois: { titulo: ep.titulo, status: ep.status },
    });

    return ep;
  }

  // ──────────────────────────────────────────────────────────────
  // ADMIN — moderação
  // ──────────────────────────────────────────────────────────────

  async listarAdmin(status?: string, limit = 50, offset = 0) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.episodioTV.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset,
        include: { submitor: { select: { id: true, nome: true, email: true } }, terreiro: { select: { id: true, nome: true } } },
      }),
      this.prisma.episodioTV.count({ where }),
    ]);
    return { data, total };
  }

  async aprovar(id: string, adminId: string) {
    const ep = await this.obterById(id);
    if (ep.status === EpisodioStatus.PUBLICADO) {
      throw new BadRequestException('Episódio já está publicado');
    }
    const atualizado = await this.prisma.episodioTV.update({
      where: { id },
      data: { status: EpisodioStatus.APROVADO, revisadoPorId: adminId, revisadoEm: new Date() },
    });
    await this.auditLogs.registrar(adminId, 'TV_EPISODIO_APROVADO', 'EPISODIO_TV', id, {});
    return atualizado;
  }

  async publicar(id: string, adminId: string) {
    const ep = await this.obterById(id);
    if (ep.status !== EpisodioStatus.APROVADO && ep.status !== EpisodioStatus.PAUSADO) {
      throw new BadRequestException('Episódio precisa estar APROVADO para publicar');
    }
    const atualizado = await this.prisma.episodioTV.update({
      where: { id },
      data: { status: EpisodioStatus.PUBLICADO, publicadoEm: new Date() },
    });
    await this.auditLogs.registrar(adminId, 'TV_EPISODIO_PUBLICADO', 'EPISODIO_TV', id, {});
    return atualizado;
  }

  async rejeitar(id: string, adminId: string, motivo?: string) {
    await this.obterById(id);
    const atualizado = await this.prisma.episodioTV.update({
      where: { id },
      data: { status: EpisodioStatus.REJEITADO, motivoRejeicao: motivo ?? null, revisadoPorId: adminId, revisadoEm: new Date() },
    });
    await this.auditLogs.registrar(adminId, 'TV_EPISODIO_REJEITADO', 'EPISODIO_TV', id, { depois: { motivo } });
    return atualizado;
  }

  private async obterById(id: string) {
    const ep = await this.prisma.episodioTV.findUnique({ where: { id } });
    if (!ep || ep.deletedAt) throw new NotFoundException('Episódio não encontrado');
    return ep;
  }
}
