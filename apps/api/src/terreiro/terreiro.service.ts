import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

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

    return { data, total, limit: filters.limit, offset: filters.offset };
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

    return {
      ...terreiro,
      stats: {
        totalAvaliacoes: avgs.total,
        mediaNota: avgs.media,
        totalFavoritos: terreiro.favoritos?.length || 0,
        totalEventos: terreiro.eventos?.length || 0,
        totalFotos: terreiro.fotos?.length || 0,
      },
      completeness: {
        score: completeness.score,
        total: completeness.total,
        items: completeness.items,
      },
      trustScoreInfo: this.getTrustScoreInfo(terreiro.trustScore),
      geoJSON: terreiro.latitude && terreiro.longitude ? {
        type: 'Point',
        coordinates: [terreiro.longitude, terreiro.latitude],
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

  async atualizar(id: string, dto: any, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    return this.prisma.terreiros.update({
      where: { id },
      data: dto,
    });
  }

  async deletar(id: string, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    await this.prisma.terreiros.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
