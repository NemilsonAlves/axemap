import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { isAdminRole } from '../common/utils/roles';
import { mascararLocalizacao } from '../common/utils/location-visibility';

const perfilInclude = {
  dirigente: { select: { id: true, nome: true, avatarUrl: true } },
  avaliacoes: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
    take: 10,
    include: {
      usuario: { select: { id: true, nome: true, avatarUrl: true } },
      resposta: true,
    },
  },
  eventos: {
    where: { deletedAt: null, dataInicio: { gte: new Date() } },
    orderBy: { dataInicio: 'asc' as const },
    take: 10,
  },
  cursos: {
    where: { deletedAt: null },
    take: 10,
  },
  acoesSociais: {
    where: { deletedAt: null },
    take: 10,
  },
  fotos: {
    orderBy: { ordem: 'asc' as const },
  },
  videos: {
    orderBy: { ordem: 'asc' as const },
  },
  favoritos: {
    take: 1,
    select: { usuarioId: true },
  },
  produtos: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
    take: 8,
  },
  conteudos: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
    take: 12,
  },
  campanhas: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
    take: 6,
  },
  // arquivoUrl é OMITIDO da resposta pública — documentos de verificação são privados
  documentosVerificacao: {
    select: { id: true, tipo: true, status: true },
  },
  _count: {
    select: {
      seguidores: true,
      membros: true,
      eventos: { where: { deletedAt: null } },
      cursos: { where: { deletedAt: null } },
      acoesSociais: { where: { deletedAt: null } },
      avaliacoes: { where: { deletedAt: null } },
      produtos: { where: { deletedAt: null } },
      conteudos: { where: { deletedAt: null } },
    },
  },
} as const;

@Injectable()
export class TerreiroService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: any, usuarioId: string) {
    const slug = dto.nome
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.terreiros.create({
      data: {
        nome: dto.nome,
        slug,
        tradicao: dto.tradicao,
        taxonomyCategory: dto.taxonomyCategory || 'POVO',
        descricaoCurta: dto.descricaoCurta,
        descricaoLonga: dto.descricaoLonga,
        cidade: dto.cidade,
        estado: dto.estado,
        latitude: dto.latitude,
        longitude: dto.longitude,
        telefone: dto.telefone,
        email: dto.email,
        instagram: dto.instagram,
        whatsapp: dto.whatsapp,
        facebook: dto.facebook,
        anoFundacao: dto.anoFundacao,
        linhagem: dto.linhagem,
        acessibilidade: dto.acessibilidade ?? false,
        estacionamento: dto.estacionamento,
        fotoUrl: dto.fotoUrl,
        criadoPorId: usuarioId,
        dirigenteId: dto.dirigenteId || usuarioId,
      },
    });
  }

  async listar(filters: {
    pais?: string;
    continente?: string;
    cidade?: string;
    estado?: string;
    tradicao?: string;
    q?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {
      deletedAt: null,
      isPublished: true,
    };

    if (filters.pais) where.pais = filters.pais;
    if (filters.continente) where.continente = filters.continente;
    if (filters.cidade) where.cidade = filters.cidade;
    if (filters.estado) where.estado = filters.estado;
    if (filters.tradicao) where.tradicao = filters.tradicao;
    if (filters.q) {
      where.OR = [
        { nome: { contains: filters.q, mode: 'insensitive' } },
        { descricaoCurta: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.terreiros.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      this.prisma.terreiros.count({ where }),
    ]);

    return { data: data.map(mascararLocalizacao), total, limit: filters.limit, offset: filters.offset };
  }

  async listarMeus(usuarioId: string) {
    const data = await this.prisma.terreiros.findMany({
      where: { dirigenteId: usuarioId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            eventos: { where: { deletedAt: null } },
            cursos: { where: { deletedAt: null } },
            acoesSociais: { where: { deletedAt: null } },
            avaliacoes: { where: { deletedAt: null } },
            fotos: true,
          },
        },
      },
    });

    return { data, total: data.length };
  }

  async buscarPorSlug(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { slug },
      include: perfilInclude,
    });

    if (!terreiro || terreiro.deletedAt) {
      throw new NotFoundException('Terreiro não encontrado');
    }

    return this.formatPerfil(terreiro);
  }

  async getPerfil(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { slug },
      include: perfilInclude,
    });

    if (!terreiro || terreiro.deletedAt) {
      throw new NotFoundException('Terreiro não encontrado');
    }

    return this.formatPerfil(terreiro);
  }

  private formatPerfil(terreiro: any) {
    const avgs = this.calcularAvaliacoes(terreiro.avaliacoes);
    const completeness = this.calcularCompletude(terreiro);
    const meses = this.mesesNaPlataforma(terreiro.createdAt);
    const respostaMedia = this.calcularTempoResposta(terreiro.avaliacoes);
    const terreiroMascarado = mascararLocalizacao(terreiro);
    const visibilidade = terreiro.visibilidadeLocalizacao ?? 'PUBLICO';

    return {
      ...terreiroMascarado,
      stats: {
        totalAvaliacoes: avgs.total,
        mediaNota: avgs.media,
        totalFavoritos: terreiro.favoritos?.length || 0,
        totalEventos: terreiro.eventos?.length || 0,
        totalFotos: terreiro.fotos?.length || 0,
      },
      hub: {
        seguidores: terreiro._count?.seguidores ?? 0,
        membros: terreiro._count?.membros ?? 0,
        totalEventos: terreiro._count?.eventos ?? 0,
        totalCursos: terreiro._count?.cursos ?? 0,
        totalAcoes: terreiro._count?.acoesSociais ?? 0,
        totalAvaliacoes: terreiro._count?.avaliacoes ?? 0,
        totalProdutos: terreiro._count?.produtos ?? 0,
        totalConteudos: terreiro._count?.conteudos ?? 0,
        mesesNaPlataforma: meses,
        tempoRespostaDias: respostaMedia,
      },
      lideranca: {
        nome: terreiro.dirigente?.nome ?? terreiro.nome,
        avatarUrl: terreiro.dirigente?.avatarUrl ?? null,
        tempoAtuacaoAnos: this.tempoAtuacao(terreiro.anoFundacao, terreiro.createdAt),
        membros: terreiro._count?.membros ?? 0,
      },
      governanca: {
        verificado: terreiro.isVerified ?? false,
        nivelVerificacao: terreiro.verificationLevel ?? null,
        documentosValidos: (terreiro.documentosVerificacao ?? []).filter(
          (d: any) => d.status === 'VALIDO' || d.status === 'APROVADO',
        ).length,
        documentos: terreiro.documentosVerificacao ?? [],
      },
      completeness: {
        score: completeness.score,
        total: completeness.total,
        items: completeness.items,
      },
      trustScoreInfo: this.getTrustScoreInfo(terreiro.trustScore),
      visibilidadeLocalizacao: visibilidade,
      geoJSON: terreiroMascarado.latitude && terreiroMascarado.longitude ? {
        type: 'Point',
        coordinates: [terreiroMascarado.longitude, terreiroMascarado.latitude],
      } : null,
    };
  }

  private calcularAvaliacoes(avaliacoes: any[]) {
    if (!avaliacoes || avaliacoes.length === 0) {
      return { total: 0, media: 0 };
    }
    const soma = avaliacoes.reduce((acc: number, a: any) => acc + a.nota, 0);
    return { total: avaliacoes.length, media: Math.round((soma / avaliacoes.length) * 10) / 10 };
  }

  private mesesNaPlataforma(createdAt?: Date | string) {
    if (!createdAt) return 0;
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return 0;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  private tempoAtuacao(anoFundacao: number | null, createdAt?: Date | string) {
    const base = typeof anoFundacao === 'number' && anoFundacao > 0 ? anoFundacao : createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
    return Math.max(1, new Date().getFullYear() - base);
  }

  private calcularTempoResposta(avaliacoes: any[]) {
    if (!avaliacoes || avaliacoes.length === 0) return null;
    const comResposta = avaliacoes
      .filter((a: any) => a.resposta?.createdAt)
      .map((a: any) => {
        const criada = new Date(a.createdAt).getTime();
        const respondida = new Date(a.resposta.createdAt).getTime();
        return Math.round((respondida - criada) / (1000 * 60 * 60 * 24));
      });
    if (comResposta.length === 0) return null;
    return Math.round(comResposta.reduce((s, v) => s + v, 0) / comResposta.length);
  }

  private calcularCompletude(terreiro: any) {
    const checks = [
      { key: 'fotoUrl', label: 'Foto principal', peso: 2, ok: !!terreiro.fotoUrl },
      { key: 'descricaoLonga', label: 'Descrição completa', peso: 2, ok: !!terreiro.descricaoLonga },
      { key: 'telefone', label: 'Telefone', peso: 1, ok: !!terreiro.telefone },
      { key: 'whatsapp', label: 'WhatsApp', peso: 1, ok: !!terreiro.whatsapp },
      { key: 'instagram', label: 'Instagram', peso: 1, ok: !!terreiro.instagram },
      { key: 'website', label: 'Site', peso: 1, ok: !!terreiro.website },
      { key: 'horarioFuncionamento', label: 'Horário de funcionamento', peso: 2, ok: !!terreiro.horarioFuncionamento },
      { key: 'fotos', label: 'Galeria de fotos', peso: 2, ok: (terreiro.fotos?.length || 0) > 0 },
      { key: 'eventos', label: 'Eventos cadastrados', peso: 2, ok: (terreiro.eventos?.length || 0) > 0 },
      { key: 'anoFundacao', label: 'Ano de fundação', peso: 1, ok: !!terreiro.anoFundacao },
      { key: 'linhagem', label: 'Linhagem', peso: 1, ok: !!terreiro.linhagem },
      { key: 'acessibilidade', label: 'Info de acessibilidade', peso: 1, ok: !!terreiro.acessibilidade },
    ];

    const totalPeso = checks.reduce((s, c) => s + c.peso, 0);
    const obtido = checks.reduce((s, c) => s + (c.ok ? c.peso : 0), 0);
    const score = Math.round((obtido / totalPeso) * 100);

    return { score, total: totalPeso, items: checks.map(c => ({ ...c, done: c.ok })) };
  }

  private getTrustScoreInfo(score: number) {
    let nivel = 'INITIATE';
    let label = 'Iniciante';

    if (score >= 80) { nivel = 'LEGENDARY'; label = 'Lendário'; }
    else if (score >= 60) { nivel = 'AUTHORITY'; label = 'Autoridade'; }
    else if (score >= 40) { nivel = 'ESTABLISHED'; label = 'Estabelecido'; }
    else if (score >= 20) { nivel = 'EMERGING'; label = 'Emergente'; }

    return { score, nivel, label };
  }

  async atualizar(id: string, dto: any, usuario: { id: string; role?: string }) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const isAdmin = isAdminRole(usuario.role);
    if (terreiro.dirigenteId !== usuario.id && !isAdmin) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode editar este perfil');
    }

    if (dto.visibilidadeLocalizacao !== undefined) {
      const valoresValidos = ['PUBLICO', 'APROXIMADA', 'PRIVADA'];
      if (!valoresValidos.includes(dto.visibilidadeLocalizacao)) {
        throw new BadRequestException(`visibilidadeLocalizacao inválida. Use uma de: ${valoresValidos.join(', ')}`);
      }
    }

    return this.prisma.terreiros.update({
      where: { id },
      data: dto,
    });
  }

  private async verificarDirigente(usuarioId: string, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { dirigenteId: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId !== usuarioId) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar este perfil');
    }
  }

  async adicionarFoto(id: string, usuarioId: string, dto: { url: string; thumbUrl?: string; alt?: string; isPrincipal?: boolean }) {
    if (!dto.url) throw new BadRequestException('url é obrigatória');
    await this.verificarDirigente(usuarioId, id);

    if (dto.isPrincipal) {
      await this.prisma.terreiroFoto.updateMany({
        where: { terreiroId: id },
        data: { isPrincipal: false },
      });
    }

    const foto = await this.prisma.terreiroFoto.create({
      data: {
        terreiroId: id,
        url: dto.url,
        thumbUrl: dto.thumbUrl ?? null,
        alt: dto.alt ?? null,
        isPrincipal: dto.isPrincipal ?? false,
      },
    });

    const terreiro = await this.prisma.terreiros.findUnique({ where: { id }, select: { fotoUrl: true } });
    if (dto.isPrincipal || !terreiro?.fotoUrl) {
      await this.prisma.terreiros.update({ where: { id }, data: { fotoUrl: dto.url } });
    }
    return foto;
  }

  async removerFoto(id: string, usuarioId: string, fotoId: string) {
    await this.verificarDirigente(usuarioId, id);
    const foto = await this.prisma.terreiroFoto.findFirst({ where: { id: fotoId, terreiroId: id } });
    if (!foto) throw new NotFoundException('Foto não encontrada');

    await this.prisma.terreiroFoto.delete({ where: { id: fotoId } });
    const restantes = await this.prisma.terreiroFoto.findMany({
      where: { terreiroId: id },
      orderBy: { ordem: 'asc' },
    });

    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (terreiro?.fotoUrl === foto.url) {
      await this.prisma.terreiros.update({
        where: { id },
        data: { fotoUrl: restantes[0]?.url ?? null },
      });
    }
    return { removido: true };
  }

  async deletar(id: string, _usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    await this.prisma.terreiros.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}