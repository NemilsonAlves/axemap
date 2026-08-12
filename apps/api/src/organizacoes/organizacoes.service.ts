import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class OrganizacoesService {
  constructor(private prisma: PrismaService) {}

  private readonly publicSelect = {
    id: true,
    nome: true,
    nomePublico: true,
    slug: true,
    tipo: true,
    pais: true,
    estado: true,
    cidade: true,
    website: true,
    descricao: true,
    historia: true,
    tradicoes: true,
    anoFundacao: true,
    areaAtuacao: true,
    numOrganizacoesAssociadas: true,
    verificacao: true,
    trustScore: true,
    publicadoEm: true,
    createdAt: true,
  };

  async listar(opts: {
    q?: string;
    tipo?: string;
    pais?: string;
    verificacao?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null, isPublished: true };
    if (opts.tipo) where.tipo = opts.tipo;
    if (opts.pais) where.pais = opts.pais;
    if (opts.verificacao) where.verificacao = opts.verificacao;
    if (opts.q) {
      where.OR = [
        { nome: { contains: opts.q, mode: 'insensitive' } },
        { cidade: { contains: opts.q, mode: 'insensitive' } },
        { areaAtuacao: { contains: opts.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.organizacoes.count({ where }),
      this.prisma.organizacoes.findMany({
        where,
        select: this.publicSelect,
        orderBy: [{ trustScore: 'desc' }, { nome: 'asc' }],
        take: opts.limit ?? 24,
        skip: opts.offset ?? 0,
      }),
    ]);

    return { total, items };
  }

  async detalhe(slug: string) {
    const org = await this.prisma.organizacoes.findFirst({
      where: { slug, deletedAt: null, isPublished: true },
      select: { ...this.publicSelect, criadoPorId: true },
    });
    if (!org) throw new NotFoundException('Organização não encontrada');

    const comunidades = await this.prisma.organizacaoRelacionamentos.findMany({
      where: { organizacaoId: org.id, status: 'ACEITA' },
      select: {
        terreiro: {
          select: {
            id: true,
            nome: true,
            slug: true,
            tradicao: true,
            cidade: true,
            estado: true,
            pais: true,
            fotoUrl: true,
            isVerified: true,
            verificationLevel: true,
          },
        },
      },
    });

    const totalTerreiros = comunidades.length;

    return {
      ...org,
      comunidades: comunidades.map((r) => r.terreiro),
      totalTerreiros,
    };
  }

  async criar(userId: string, dto: any) {
    if (!dto.nome || !dto.tipo) throw new BadRequestException('nome e tipo são obrigatórios');

    const slugBase = this.slugificar(dto.nome);
    const exists = await this.prisma.organizacoes.findUnique({ where: { slug: slugBase } });
    const slug = exists ? `${slugBase}-${Date.now().toString(36)}` : slugBase;

    return this.prisma.organizacoes.create({
      data: {
        nome: dto.nome,
        nomePublico: dto.nomePublico ?? null,
        slug,
        tipo: dto.tipo,
        pais: dto.pais ?? 'BR',
        estado: dto.estado ?? null,
        cidade: dto.cidade ?? null,
        website: dto.website ?? null,
        descricao: dto.descricao ?? null,
        historia: dto.historia ?? null,
        tradicoes: dto.tradicoes ?? [],
        anoFundacao: dto.anoFundacao ?? null,
        areaAtuacao: dto.areaAtuacao ?? null,
        contatos: dto.contatos ?? null,
        criadoPorId: userId,
      },
      select: this.publicSelect,
    });
  }

  async atualizar(userId: string, id: string, dto: any, isAdmin = false) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (!isAdmin && org.criadoPorId !== userId) throw new ForbiddenException('Sem permissão');

    const data: any = {};
    const campos = [
      'nome', 'nomePublico', 'tipo', 'pais', 'estado', 'cidade', 'website',
      'descricao', 'historia', 'tradicoes', 'anoFundacao', 'areaAtuacao', 'contatos',
    ];
    for (const campo of campos) {
      if (campo in dto) data[campo] = dto[campo];
    }

    return this.prisma.organizacoes.update({
      where: { id },
      data,
      select: this.publicSelect,
    });
  }

  async publicar(userId: string, id: string, isAdmin = false) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (!isAdmin && org.criadoPorId !== userId) throw new ForbiddenException('Sem permissão');

    return this.prisma.organizacoes.update({
      where: { id },
      data: { isPublished: true, publicadoEm: new Date() },
      select: this.publicSelect,
    });
  }

  async solicitarVinculo(userId: string, id: string, terreiroId: string) {
    const org = await this.prisma.organizacoes.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    if (org.criadoPorId !== userId) throw new ForbiddenException('Sem permissão');

    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: terreiroId } });
    if (!terreiro) throw new BadRequestException('Terreiro não encontrado');

    const existe = await this.prisma.organizacaoRelacionamentos.findUnique({
      where: { organizacaoId_terreiroId: { organizacaoId: id, terreiroId } },
    });
    if (existe) throw new BadRequestException('Vínculo já solicitado ou existente');

    return this.prisma.organizacaoRelacionamentos.create({
      data: { organizacaoId: id, terreiroId, status: 'PENDENTE' },
    });
  }

  async relacionamentosDaOrganizacao(id: string) {
    const rels = await this.prisma.organizacaoRelacionamentos.findMany({
      where: { organizacaoId: id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        terreiro: {
          select: {
            id: true,
            nome: true,
            slug: true,
            tradicao: true,
            cidade: true,
            estado: true,
            pais: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rels;
  }

  async aceitarVinculo(userId: string, id: string, relacionamentoId: string) {
    const rel = await this.prisma.organizacaoRelacionamentos.findUnique({
      where: { id: relacionamentoId },
      include: { terreiro: true, organizacao: true },
    });
    if (!rel || rel.organizacaoId !== id) throw new NotFoundException('Vínculo não encontrado');

    const dirigenteOuAdmin = false;
    if (rel.terreiro.dirigenteId !== userId) {
      throw new ForbiddenException('Somente o dirigente do terreiro pode aceitar vínculos');
    }

    const aceito = await this.prisma.organizacaoRelacionamentos.update({
      where: { id: relacionamentoId },
      data: { status: 'ACEITA' },
    });

    await this.prisma.organizacoes.update({
      where: { id },
      data: { numOrganizacoesAssociadas: { increment: 1 } },
    });

    return aceito;
  }

  async recusarVinculo(userId: string, id: string, relacionamentoId: string) {
    const rel = await this.prisma.organizacaoRelacionamentos.findUnique({
      where: { id: relacionamentoId },
    });
    if (!rel || rel.organizacaoId !== id) throw new NotFoundException('Vínculo não encontrado');

    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: rel.terreiroId },
      select: { dirigenteId: true },
    });
    if (!terreiro || terreiro.dirigenteId !== userId) {
      throw new ForbiddenException('Somente o dirigente do terreiro pode recusar vínculos');
    }

    return this.prisma.organizacaoRelacionamentos.update({
      where: { id: relacionamentoId },
      data: { status: 'RECUSADA' },
    });
  }

  async listarRegioes() {
    return this.prisma.regioes.findMany({
      where: { isPublished: true },
      include: {
        regioesFilhas: { include: { tradicoes: true }, orderBy: { ordenacao: 'asc' } },
        tradicoes: true,
      },
      orderBy: { ordenacao: 'asc' },
    });
  }

  private slugificar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}