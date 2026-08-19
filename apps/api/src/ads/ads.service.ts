import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AdStatus, AdPlacement, AdCategory, CreateAdOrderDto } from './ads.types';
// PrismaService terá adCampanha e adPagamento após `prisma generate`.
// Usamos casts de tipo (as any) até a migration ser aplicada e o cliente regenerado.


/**
 * AdsService — publicidade do AxéMap.
 *
 * REGRA ABSOLUTA: nenhuma operação aqui altera Trust Score, verificação,
 * certificação, posição orgânica, avaliações ou denúncias.
 * Anúncios publicados SEMPRE exibem rótulo "PATROCINADO" ou "PUBLICIDADE".
 */
@Injectable()
export class AdsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // PUBLIC — catálogo de anúncios ativos para renderização
  // ──────────────────────────────────────────────────────────────

  /**
   * Retorna anúncios PUBLICADOS para um placement específico.
   * Sempre inclui campo `rotulo: "PATROCINADO"` para garantir identificação
   * visual obrigatória.
   */
  async listarPublicados(placement?: AdPlacement, cidadeAlvo?: string) {
    const where: any = { status: AdStatus.PUBLICADO };
    if (placement) where.placement = placement;
    if (cidadeAlvo) {
      where.OR = [{ cidadeAlvo }, { cidadeAlvo: null }];
    }

    const now = new Date();
    where.dataInicio = { lte: now };
    where.OR = [
      { dataFim: null },
      { dataFim: { gte: now } },
    ];

    const ads = await (this.prisma as any).adCampanha.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: {
        id: true,
        titulo: true,
        descricao: true,
        destinatarioUrl: true,
        imagemUrl: true,
        placement: true,
        category: true,
        cidadeAlvo: true,
        estadoAlvo: true,
      },
    });

    // Garantia: SEMPRE inclui rótulo de publicidade
    return ads.map((ad: any) => ({ ...ad, rotulo: 'PATROCINADO' }));
  }

  // ──────────────────────────────────────────────────────────────
  // ANUNCIANTE — criação e gestão de pedidos
  // ──────────────────────────────────────────────────────────────

  async criarPedido(dto: CreateAdOrderDto, usuarioId: string) {
    this.validarDto(dto);

    const campanha = await (this.prisma as any).adCampanha.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        destinatarioUrl: dto.destinatarioUrl ?? null,
        imagemUrl: dto.imagemUrl ?? null,
        placement: dto.placement,
        category: dto.category,
        cidadeAlvo: dto.cidadeAlvo ?? null,
        estadoAlvo: dto.estadoAlvo ?? null,
        orcamentoBRL: dto.orcamentoBRL,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        status: AdStatus.AGUARDANDO_PAGAMENTO,
        anuncianteId: usuarioId,
      },
    });

    await this.auditLogs.registrar(usuarioId, 'ADS_PEDIDO_CRIADO', 'AD_CAMPANHA', campanha.id, {
      depois: { titulo: campanha.titulo, orcamento: campanha.orcamentoBRL },
    });

    return campanha;
  }

  async meusPedidos(usuarioId: string, limit = 50, offset = 0) {
    const [data, total] = await Promise.all([
      (this.prisma as any).adCampanha.findMany({
        where: { anuncianteId: usuarioId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      (this.prisma as any).adCampanha.count({ where: { anuncianteId: usuarioId } }),
    ]);
    return { data, total };
  }

  async detalhePedido(id: string, usuarioId: string, isAdmin: boolean) {
    const campanha = await (this.prisma as any).adCampanha.findUnique({ where: { id } });
    if (!campanha) throw new NotFoundException('Pedido de anúncio não encontrado');
    if (!isAdmin && campanha.anuncianteId !== usuarioId) {
      throw new ForbiddenException('Acesso negado');
    }
    return campanha;
  }

  // ──────────────────────────────────────────────────────────────
  // ADMIN — moderação e controle de anúncios
  // ──────────────────────────────────────────────────────────────

  async listarAdmin(status?: string, limit = 50, offset = 0) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      (this.prisma as any).adCampanha.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
        skip: offset,
        select: {
          id: true,
          titulo: true,
          status: true,
          placement: true,
          category: true,
          orcamentoBRL: true,
          dataInicio: true,
          dataFim: true,
          anuncianteId: true,
          createdAt: true,
        },
      }),
      (this.prisma as any).adCampanha.count({ where }),
    ]);
    return { data, total };
  }

  async aprovar(id: string, adminId: string) {
    const campanha = await this.obter(id);
    if (campanha.status === AdStatus.PUBLICADO) {
      throw new BadRequestException('Anúncio já está publicado');
    }

    const atualizado = await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { status: AdStatus.APROVADO, revisadoPorId: adminId, revisadoEm: new Date() },
    });

    await this.auditLogs.registrar(adminId, 'ADS_APROVADO', 'AD_CAMPANHA', id, {
      depois: { status: AdStatus.APROVADO },
    });

    return atualizado;
  }

  async publicar(id: string, adminId: string) {
    const campanha = await this.obter(id);
    if (campanha.status !== AdStatus.APROVADO && campanha.status !== AdStatus.PAUSADO) {
      throw new BadRequestException('Anúncio precisa estar APROVADO para publicar');
    }

    // REGRA ABSOLUTA: publicar anúncio não altera Trust Score nem verificação
    const atualizado = await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { status: AdStatus.PUBLICADO, publicadoEm: new Date() },
    });

    await this.auditLogs.registrar(adminId, 'ADS_PUBLICADO', 'AD_CAMPANHA', id, {
      depois: { status: AdStatus.PUBLICADO },
    });

    return atualizado;
  }

  async pausar(id: string, adminId: string) {
    await this.obter(id);
    const atualizado = await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { status: AdStatus.PAUSADO },
    });
    await this.auditLogs.registrar(adminId, 'ADS_PAUSADO', 'AD_CAMPANHA', id, {});
    return atualizado;
  }

  async rejeitar(id: string, adminId: string, motivo?: string) {
    await this.obter(id);
    const atualizado = await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { status: AdStatus.REJEITADO, motivoRejeicao: motivo ?? null },
    });
    await this.auditLogs.registrar(adminId, 'ADS_REJEITADO', 'AD_CAMPANHA', id, {
      depois: { motivo },
    });
    return atualizado;
  }

  async bloquear(id: string, adminId: string) {
    await this.obter(id);
    const atualizado = await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { status: AdStatus.BLOQUEADO },
    });
    await this.auditLogs.registrar(adminId, 'ADS_BLOQUEADO', 'AD_CAMPANHA', id, {});
    return atualizado;
  }

  async registrarImpressao(id: string) {
    await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { impressoes: { increment: 1 } },
    });
  }

  async registrarClique(id: string) {
    await (this.prisma as any).adCampanha.update({
      where: { id },
      data: { cliques: { increment: 1 } },
    });
  }

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────

  private async obter(id: string) {
    const campanha = await (this.prisma as any).adCampanha.findUnique({ where: { id } });
    if (!campanha) throw new NotFoundException('Pedido de anúncio não encontrado');
    return campanha;
  }

  private validarDto(dto: CreateAdOrderDto) {
    if (!dto.titulo?.trim()) throw new BadRequestException('titulo é obrigatório');
    if (!dto.placement) throw new BadRequestException('placement é obrigatório');
    if (!dto.category) throw new BadRequestException('category é obrigatório');
    if (!dto.orcamentoBRL || dto.orcamentoBRL <= 0) {
      throw new BadRequestException('orcamentoBRL deve ser maior que zero');
    }
    if (!dto.dataInicio) throw new BadRequestException('dataInicio é obrigatório');

    const inicio = new Date(dto.dataInicio);
    if (isNaN(inicio.getTime())) throw new BadRequestException('dataInicio inválida');

    if (dto.dataFim) {
      const fim = new Date(dto.dataFim);
      if (isNaN(fim.getTime())) throw new BadRequestException('dataFim inválida');
      if (fim <= inicio) throw new BadRequestException('dataFim deve ser após dataInicio');
    }

    const validPlacements = Object.values(AdPlacement);
    if (!validPlacements.includes(dto.placement as AdPlacement)) {
      throw new BadRequestException(`placement inválido. Use um de: ${validPlacements.join(', ')}`);
    }

    const validCategories = Object.values(AdCategory);
    if (!validCategories.includes(dto.category as AdCategory)) {
      throw new BadRequestException(`category inválida. Use uma de: ${validCategories.join(', ')}`);
    }
  }
}
