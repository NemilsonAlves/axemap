import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { isAdminRole } from '../common/utils/roles';

@Injectable()
export class GrowthService {
  constructor(private prisma: PrismaService) {}

  async verificarDirigente(usuarioId: string, role: string | undefined, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: terreiroId } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    const isAdmin = isAdminRole(role);
    if (terreiro.dirigenteId !== usuarioId && !isAdmin) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar membros e estatísticas');
    }
    return terreiro;
  }

  async followTerreiro(usuarioId: string, terreiroId: string) {
    const existing = await this.prisma.seguidoresTerreiro.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    if (existing) throw new ConflictException('Você já segue este terreiro');

    return this.prisma.seguidoresTerreiro.create({ data: { usuarioId, terreiroId } });
  }

  async unfollowTerreiro(usuarioId: string, terreiroId: string) {
    await this.prisma.seguidoresTerreiro.delete({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    return { success: true };
  }

  async favoriteTerreiro(usuarioId: string, terreiroId: string) {
    const existing = await this.prisma.favoritos.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    if (existing) throw new ConflictException('Terreiro já favoritado');

    return this.prisma.favoritos.create({ data: { usuarioId, terreiroId } });
  }

  async unfavoriteTerreiro(usuarioId: string, terreiroId: string) {
    await this.prisma.favoritos.delete({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    return { success: true };
  }

  async confirmarPresenca(usuarioId: string, eventoId: string, status = 'CONFIRMADO') {
    const existing = await this.prisma.presencaEvento.findUnique({
      where: { usuarioId_eventoId: { usuarioId, eventoId } },
    });
    if (existing) {
      return this.prisma.presencaEvento.update({
        where: { id: existing.id },
        data: { status },
      });
    }
    return this.prisma.presencaEvento.create({ data: { usuarioId, eventoId, status } });
  }

  async removerPresenca(usuarioId: string, eventoId: string) {
    await this.prisma.presencaEvento.delete({
      where: { usuarioId_eventoId: { usuarioId, eventoId } },
    });
    return { success: true };
  }

  async listarFavoritos(usuarioId: string, limite = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.favoritos.findMany({
        where: { usuarioId },
        include: {
          terreiro: {
            select: {
              id: true, nome: true, slug: true, tradicao: true, cidade: true, estado: true,
              trustScore: true, isVerified: true, fotoUrl: true, descricaoCurta: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.favoritos.count({ where: { usuarioId } }),
    ]);

    return { data: data.map(f => f.terreiro), total };
  }

  async getSeguidores(terreiroId: string, limit = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.seguidoresTerreiro.findMany({
        where: { terreiroId },
        include: {
          usuario: { select: { id: true, nome: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit, skip: offset,
      }),
      this.prisma.seguidoresTerreiro.count({ where: { terreiroId } }),
    ]);
    return { data, total };
  }

  async convidarMembro(
    convidadoPorId: string,
    role: string | undefined,
    terreiroId: string,
    email: string,
    papel = 'COLABORADOR',
  ) {
    await this.verificarDirigente(convidadoPorId, role, terreiroId);

    const usuario = await this.prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const existing = await this.prisma.membrosTerreiro.findUnique({
      where: { usuarioId_terreiroId: { usuarioId: usuario.id, terreiroId } },
    });
    if (existing) throw new ConflictException('Usuário já é membro deste terreiro');

    return this.prisma.membrosTerreiro.create({
      data: {
        usuarioId: usuario.id,
        terreiroId,
        papel,
        convidadoPorId,
        conviteStatus: 'PENDENTE',
      },
    });
  }

  async aceitarConvite(usuarioId: string, terreiroId: string) {
    const membro = await this.prisma.membrosTerreiro.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    if (!membro) throw new NotFoundException('Convite não encontrado');

    return this.prisma.membrosTerreiro.update({
      where: { id: membro.id },
      data: { conviteStatus: 'ACEITO' },
    });
  }

  async recusarConvite(usuarioId: string, terreiroId: string) {
    const membro = await this.prisma.membrosTerreiro.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    if (!membro) throw new NotFoundException('Convite não encontrado');

    return this.prisma.membrosTerreiro.update({
      where: { id: membro.id },
      data: { conviteStatus: 'RECUSADO' },
    });
  }

  async getMembros(terreiroId: string) {
    return this.prisma.membrosTerreiro.findMany({
      where: { terreiroId },
      include: {
        usuario: { select: { id: true, nome: true, avatarUrl: true, email: true } },
        convidadoPor: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMembroPapel(usuarioId: string, role: string | undefined, membroId: string, papel: string) {
    const membro = await this.prisma.membrosTerreiro.findUnique({ where: { id: membroId } });
    if (!membro) throw new NotFoundException('Membro não encontrado');
    await this.verificarDirigente(usuarioId, role, membro.terreiroId);
    return this.prisma.membrosTerreiro.update({
      where: { id: membroId },
      data: { papel },
    });
  }

  async removerMembro(usuarioId: string, role: string | undefined, membroId: string) {
    const membro = await this.prisma.membrosTerreiro.findUnique({ where: { id: membroId } });
    if (!membro) throw new NotFoundException('Membro não encontrado');
    await this.verificarDirigente(usuarioId, role, membro.terreiroId);
    await this.prisma.membrosTerreiro.delete({ where: { id: membroId } });
    return { success: true };
  }

  async convitesParaUsuario(usuarioId: string) {
    return this.prisma.membrosTerreiro.findMany({
      where: { usuarioId, conviteStatus: 'PENDENTE' },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async criarIndicacao(indicadorId: string, emailIndicado: string, terreiroId?: string) {
    const indicado = await this.prisma.usuarios.findUnique({ where: { email: emailIndicado } });
    if (!indicado) throw new NotFoundException('Usuário não encontrado');

    const existing = await this.prisma.indicacoes.findUnique({
      where: { indicadorId_indicadoId: { indicadorId, indicadoId: indicado.id } },
    });
    if (existing) throw new ConflictException('Indicação já registrada');

    return this.prisma.indicacoes.create({
      data: { indicadorId, indicadoId: indicado.id, terreiroId },
    });
  }

  async converterIndicacao(indicadoId: string) {
    const indicacao = await this.prisma.indicacoes.findFirst({
      where: { indicadoId, status: 'PENDENTE' },
    });
    if (!indicacao) return null;

    return this.prisma.indicacoes.update({
      where: { id: indicacao.id },
      data: { status: 'CONVERTIDO', convertidoEm: new Date() },
    });
  }

  async registrarAcessoQRCode(terreiroId: string, userAgent?: string, ip?: string) {
    return this.prisma.acessoQRCode.create({
      data: { terreiroId, userAgent, ip },
    });
  }

  async getDadosQRCode(terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { id: true, slug: true, nome: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const url = `https://axemap.com.br/t/${terreiro.slug}`;
    const totalAcessos = await this.prisma.acessoQRCode.count({ where: { terreiroId } });

    return { url, slug: terreiro.slug, totalAcessos, nome: terreiro.nome };
  }

  async getGrowthAnalytics(usuarioId: string, role: string | undefined, terreiroId: string) {
    await this.verificarDirigente(usuarioId, role, terreiroId);

    const [seguidores, favoritos, membros, indicacoes, acessosQR, presencas] = await Promise.all([
      this.prisma.seguidoresTerreiro.count({ where: { terreiroId } }),
      this.prisma.favoritos.count({ where: { terreiroId } }),
      this.prisma.membrosTerreiro.count({ where: { terreiroId, conviteStatus: 'ACEITO' } }),
      this.prisma.indicacoes.count({ where: { terreiroId } }),
      this.prisma.acessoQRCode.count({ where: { terreiroId } }),
      this.prisma.presencaEvento.count({
        where: {
          evento: { terreiroId },
          status: 'CONFIRMADO',
        },
      }),
    ]);

    const indicacoesConvertidas = await this.prisma.indicacoes.count({
      where: { terreiroId, status: 'CONVERTIDO' },
    });

    return {
      seguidores,
      favoritos,
      membros,
      indicacoes: { total: indicacoes, convertidas: indicacoesConvertidas, taxaConversao: indicacoes > 0 ? Math.round((indicacoesConvertidas / indicacoes) * 100) : 0 },
      acessosQR,
      presencasConfirmadas: presencas,
    };
  }
}
