import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { TaxonomyCategory } from '@axemap/shared';
import { PrismaService } from '../database/prisma.service';

const CATEGORIES = new Set(Object.values(TaxonomyCategory));

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  validarCategoria(categoria: string): TaxonomyCategory {
    if (!CATEGORIES.has(categoria as TaxonomyCategory)) {
      throw new BadRequestException(
        `Categoria de taxonomia inválida. Use um de: ${Array.from(CATEGORIES).join(', ')}`,
      );
    }
    return categoria as TaxonomyCategory;
  }

  async existeTerreiroComCategoria(terreiroId: string, categoria: TaxonomyCategory): Promise<boolean> {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { taxonomyCategory: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    return terreiro.taxonomyCategory === categoria;
  }

  async existeOrganizacaoComCategoria(orgId: string, categoria: TaxonomyCategory): Promise<boolean> {
    const org = await this.prisma.instituicoes.findUnique({
      where: { id: orgId },
      select: { taxonomyCategory: true },
    });
    if (!org) throw new NotFoundException('Organização não encontrada');
    return org.taxonomyCategory === categoria;
  }

  async listarTerreirosPorCategoria(categoria: TaxonomyCategory, limite = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { taxonomyCategory: categoria, deletedAt: null },
        take: limite,
        skip: offset,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.terreiros.count({ where: { taxonomyCategory: categoria, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async listarEventosPorCategoria(categoria: TaxonomyCategory, limite = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.eventos.findMany({
        where: { taxonomyCategory: categoria, deletedAt: null },
        take: limite,
        skip: offset,
        orderBy: { dataInicio: 'asc' },
      }),
      this.prisma.eventos.count({ where: { taxonomyCategory: categoria, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async listarConteudosPorCategoria(categoria: TaxonomyCategory, limite = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.conteudos.findMany({
        where: { taxonomyCategory: categoria, deletedAt: null },
        take: limite,
        skip: offset,
        orderBy: { titulo: 'asc' },
      }),
      this.prisma.conteudos.count({ where: { taxonomyCategory: categoria, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async listarInstituicoesPorCategoria(categoria: TaxonomyCategory, limite = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.instituicoes.findMany({
        where: { taxonomyCategory: categoria, deletedAt: null },
        take: limite,
        skip: offset,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.instituicoes.count({ where: { taxonomyCategory: categoria, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async listarOrganizacoesPorCategoria(categoria: TaxonomyCategory, limite = 20, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.organizacoes.findMany({
        where: { taxonomyCategory: categoria, deletedAt: null },
        take: limite,
        skip: offset,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.organizacoes.count({ where: { taxonomyCategory: categoria, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async podeRelacionar(entidade1: 'terreiro' | 'organizacao' | 'instituicao' | 'evento' | 'conteudo', id1: string, entidade2: 'terreiro' | 'organizacao' | 'instituicao' | 'evento' | 'conteudo', id2: string, categoriaRelacionamento: TaxonomyCategory): Promise<boolean> {
    const buscador = {
      terreiro: async (id: string) => await this.prisma.terreiros.findUnique({ where: { id }, select: { taxonomyCategory: true } }),
     organizacao: async (id: string) => await this.prisma.organizacoes.findUnique({ where: { id }, select: { taxonomyCategory: true } }),
      instituicao: async (id: string) => await this.prisma.instituicoes.findUnique({ where: { id }, select: { taxonomyCategory: true } }),
      evento: async (id: string) => await this.prisma.eventos.findUnique({ where: { id }, select: { taxonomyCategory: true } }),
      conteudo: async (id: string) => await this.prisma.conteudos.findUnique({ where: { id }, select: { taxonomyCategory: true } }),
    };

    const e1 = await buscador[entidade1](id1);
    const e2 = await buscador[entidade2](id2);

    if (!e1 || !e2) return false;

    return e1.taxonomyCategory === categoriaRelacionamento && e2.taxonomyCategory === categoriaRelacionamento;
  }
}