import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  GraphEntidadeTipo,
  GraphRelacionamentoTipo,
  GraphStatus,
  GraphFonte,
  ConteudoStatus,
  DuplicidadeStatus,
  NivelPrivacidade,
} from '@axemap/shared';

const RAIO_PADRAO_KM = 50;

// =================================================================
//  HELPERS
// =================================================================

/** Remove acentos e normaliza para comparação de nomes. */
function normalizar(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Tokeniza o nome normalizado. */
function tokens(texto: string): string[] {
  return normalizar(texto).split(' ').filter((t) => t && t.length > 2);
}

/** Similaridade Jaccard entre conjuntos de tokens. */
function similaridade(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const uniao = ta.size + tb.size - inter;
  return uniao ? inter / uniao : 0;
}

function distanciaKm(lat1: number | null, lon1: number | null, lat2: number | null, lon2: number | null): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CONFIANCA_POR_FONTE: Record<string, number> = {
  INSTITUICAO: 0.8,
  USUARIO: 0.3,
  ADMIN: 1,
  API_EXTERNA: 0.6,
  PESQUISA: 0.9,
  DOCUMENTO: 0.9,
  IA_SUGERIDO: 0.2,
};

const ROTULO_POR_TIPO: Record<string, string> = {
  PERTENCE_A: 'pertence a',
  LOCALIZADO_EM: 'localizado em',
  ORGANIZA: 'organiza',
  PARTICIPA: 'participa',
  MINISTRA: 'ministra',
  OFERECE: 'oferece',
  PATROCINA: 'patrocina',
  APOIA: 'apoia',
  COLABORA_COM: 'colabora com',
  RELACIONADO_A: 'relacionado a',
  FAZ_PARTE_DE: 'faz parte de',
  PESQUISA: 'pesquisa',
  PUBLICOU: 'publicou',
  PRESERVA: 'preserva',
  PROMOVE: 'promove',
  REALIZA: 'realiza',
  PARTICIPA_DE: 'participa de',
  RECEBE_APOIO_DE: 'recebe apoio de',
  GERENCIA: 'gerencia',
  CERTIFICADO_POR: 'certificado por',
  VERIFICADO_POR: 'verificado por',
  TEM_EVENTO: 'tem evento',
  TEM_CURSO: 'tem curso',
  TEM_PROJETO: 'tem projeto',
  TEM_CAMPANHA: 'tem campanha',
  TEM_CONTEUDO: 'tem conteúdo',
};

const GRAOS_TIPOS: Record<string, { label: string; emoji: string }> = {
  TERREIRO: { label: 'Terreiro', emoji: '🛕' },
  INSTITUICAO: { label: 'Instituição', emoji: '🏛️' },
  EVENTO: { label: 'Evento', emoji: '📅' },
  CURSO: { label: 'Curso', emoji: '🎓' },
  CAMPANHA: { label: 'Campanha', emoji: '🤝' },
  ACAO_SOCIAL: { label: 'Ação social', emoji: '💚' },
  PROJETO: { label: 'Projeto', emoji: '🏗️' },
  CONTEUDO: { label: 'Conteúdo', emoji: '📖' },
  PESQUISA: { label: 'Pesquisa', emoji: '🔬' },
  PATRIMONIO: { label: 'Patrimônio', emoji: '🏺' },
  PRODUTO: { label: 'Produto', emoji: '🛍️' },
  PESSOA: { label: 'Pessoa', emoji: '👤' },
  COMUNIDADE: { label: 'Comunidade', emoji: '🌍' },
};

@Injectable()
export class AxegraphService {
  constructor(private prisma: PrismaService) {}

  // =================================================================
  //  INGESTÃO / SINCRONIZAÇÃO (as entidades do grafo espelham as fontes)
  //  MVP: fonte única de verdade continua sendo cada tabela de domínio.
  // =================================================================

  private async sincronizarFonte(
    tipo: GraphEntidadeTipo,
    rows: { id: string; nome: string; slug?: string | null; descricao?: string | null; cidade?: string | null; estado?: string | null; latitude?: number | null; longitude?: number | null }[],
  ) {
    const grafos: any[] = [];
    for (const p of rows) {
      grafos.push(
        this.prisma.graphEntidade.upsert({
          where: { entidadeTipo_entidadeId: { entidadeTipo: tipo, entidadeId: p.id } },
          create: {
            entidadeTipo: tipo,
            entidadeId: p.id,
            nome: p.nome,
            slug: p.slug ?? null,
            descricaoCurta: p.descricao?.slice(0, 500) ?? null,
            cidade: p.cidade ?? null,
            estado: p.estado ?? null,
            latitude: p.latitude ?? null,
            longitude: p.longitude ?? null,
            origem: GraphFonte.INSTITUICAO,
            statusIndexado: 'INDEXADO',
            indexedAt: new Date(),
          },
          update: {
            nome: p.nome,
            slug: p.slug ?? undefined,
            descricaoCurta: p.descricao?.slice(0, 500) ?? null,
            cidade: p.cidade ?? undefined,
            estado: p.estado ?? undefined,
            latitude: p.latitude ?? undefined,
            longitude: p.longitude ?? undefined,
            statusIndexado: 'INDEXADO',
            indexedAt: new Date(),
            visivel: true,
            deletedAt: null,
          },
        }),
      );
    }
    return Promise.all(grafos);
  }

  async sincronizar() {
    const [terreiros, instituicoes, eventos, cursos, campanhas, acoes, conteudos, produtos, culturais] =
      await Promise.all([
        this.prisma.terreiros.findMany({
          where: { deletedAt: null },
          select: { id: true, nome: true, slug: true, descricaoCurta: true, cidade: true, estado: true, latitude: true, longitude: true },
        }),
        this.prisma.instituicoes.findMany({
          where: { deletedAt: null },
          select: { id: true, nome: true, slug: true, descricao: true, cidade: true, estado: true },
        }),
        this.prisma.eventos.findMany({
          where: { deletedAt: null, isPublico: true },
          select: { id: true, titulo: true, descricao: true },
        }),
        this.prisma.cursos.findMany({
          where: { deletedAt: null },
          select: { id: true, titulo: true, descricao: true },
        }),
        this.prisma.campanhas.findMany({
          where: { deletedAt: null, status: { in: ['PUBLICADA', 'PRESTACAO_CONTAS', 'ENCERRADA'] } },
          select: { id: true, titulo: true, descricao: true, cidade: true, estado: true, latitude: true, longitude: true },
        }),
        this.prisma.acoesSociais.findMany({
          where: { deletedAt: null },
          select: { id: true, nome: true, descricao: true },
        }),
        this.prisma.conteudos.findMany({
          where: { deletedAt: null, publicado: true },
          select: { id: true, titulo: true, conteudo: true },
        }),
        this.prisma.produtosMarketplace.findMany({
          where: { deletedAt: null },
          select: { id: true, nome: true, descricao: true },
        }),
        this.prisma.conteudoCultural.findMany({
          where: { deletedAt: null, status: { in: [ConteudoStatus.VERIFICADA, ConteudoStatus.OFICIAL] } },
          select: { id: true, titulo: true, resumo: true, cidade: true, estado: true },
        }),
      ]);

    const [rTerreiro, rInst, rEvento, rCurso, rCampanha, rAcao, rConteudo, rProduto, rCultural] = await Promise.all([
      this.sincronizarFonte(GraphEntidadeTipo.TERREIRO, terreiros.map((t: any) => t)),
      this.sincronizarFonte(GraphEntidadeTipo.INSTITUICAO, instituicoes.map((i: any) => i)),
      this.sincronizarFonte(GraphEntidadeTipo.EVENTO, eventos.map((e: any) => ({ ...e, nome: e.titulo, slug: null }))),
      this.sincronizarFonte(GraphEntidadeTipo.CURSO, cursos.map((c: any) => ({ ...c, nome: c.titulo, slug: null }))),
      this.sincronizarFonte(GraphEntidadeTipo.CAMPANHA, campanhas.map((c: any) => c)),
      this.sincronizarFonte(GraphEntidadeTipo.ACAO_SOCIAL, acoes.map((a: any) => ({ ...a, nome: a.nome, slug: null }))),
      this.sincronizarFonte(GraphEntidadeTipo.CONTEUDO, conteudos.map((c: any) => ({ ...c, nome: c.titulo, slug: null }))),
      this.sincronizarFonte(GraphEntidadeTipo.PRODUTO, produtos.map((p: any) => p)),
      this.sincronizarFonte(GraphEntidadeTipo.PESQUISA, culturais.filter((c: any) => c.tipo === 'PESQUISA').map((c: any) => ({ ...c, nome: c.titulo, slug: null }))),
      this.sincronizarFonte(GraphEntidadeTipo.CONTEUDO, culturais.filter((c: any) => c.tipo !== 'PESQUISA').map((c: any) => ({ ...c, nome: c.titulo, slug: null }))),
    ]);

    const resultado = {
      terreiros: rTerreiro.length,
      instituicoes: rInst.length,
      eventos: rEvento.length,
      cursos: rCurso.length,
      campanhas: rCampanha.length,
      acoesSociais: rAcao.length,
      conteudos: rConteudo.length,
      produtos: rProduto.length,
      pesquisas: rCultural.filter((c: any) => c.tipo === 'PESQUISA').length,
      conteudosCulturais: rCultural.filter((c: any) => c.tipo !== 'PESQUISA').length,
      total: rTerreiro.length + rInst.length + rEvento.length + rCurso.length + rCampanha.length + rAcao.length + rConteudo.length + rProduto.length + rCultural.length,
    };
    return resultado;
  }

  // =================================================================
  //  BUSCA HÍBRIDA (keyword + geo + grafo) com justificativa
  // =================================================================

  async buscar(params: {
    q?: string;
    tipo?: GraphEntidadeTipo;
    estado?: string;
    cidade?: string;
    lat?: number;
    lon?: number;
    raio?: number;
    limit?: number;
  }) {
    const limit = Math.min(params.limit ?? 30, 100);
    const raio = params.raio ?? RAIO_PADRAO_KM;
    const where: any = { visivel: true, deletedAt: null };
    if (params.tipo) where.entidadeTipo = params.tipo;
    if (params.estado) where.estado = params.estado;
    if (params.cidade) where.cidade = { contains: params.cidade, mode: 'insensitive' };

    const candidatos = await this.prisma.graphEntidade.findMany({
      where,
      include: {
        _count: {
          select: {
            origens: { where: { status: GraphStatus.VERIFICADO, deletedAt: null } },
            alvos: { where: { status: GraphStatus.VERIFICADO, deletedAt: null } },
          },
        },
      },
      take: 2000,
    });

    const q = (params.q ?? '').trim();
    let ranqueados: { c: any; score: number; motivos: string[] }[] = [];
    if (q) {
      const nq = normalizar(q).replace(/\s+/g, ' ');
      const qLower = q.toLowerCase();
      ranqueados = candidatos
        .map((c) => {
          const nome = c.nome || '';
          const desc = c.descricaoCurta || '';
          const t = (c.tags || []).join(' ').toLowerCase();
          const nomeLower = nome.toLowerCase();

          let score = 0;
          const motivos: string[] = [];
          if (nomeLower === qLower || normalizar(nome) === nq) {
            score += 1;
            motivos.push('corresponde exatamente ao que você procura');
          }
          if (nomeLower.startsWith(qLower) || normalizar(nome).startsWith(nq)) {
            score += 0.8;
            motivos.push('nome começa com o termo pesquisado');
          }
          if (nomeLower.includes(qLower) || normalizar(nome).includes(nq)) {
            score += 0.6;
            motivos.push('nome contém o termo pesquisado');
          }
          const sim = similaridade(nome, q);
          if (sim >= 0.4) {
            score += sim * 0.7;
            motivos.push('nome semelhante ao termo pesquisado');
          }
          if (desc.toLowerCase().includes(qLower)) {
            score += 0.4;
            motivos.push('descrição menciona o termo');
          }
          if (t.includes(qLower)) {
            score += 0.3;
            motivos.push('marcado com tag relacionada');
          }
          return { c, score, motivos };
        })
        .filter((x) => x.score > 0.1)
        .sort((a, b) => b.score - a.score);
    } else {
      ranqueados = candidatos.map((c) => ({ c, score: 0, motivos: ['entidade do diretório'] }));
      ranqueados.sort((a, b) => b.c._count.origens + b.c._count.alvos - (a.c._count.origens + a.c._count.alvos));
    }

    // Reforço geográfico e filtro por raio
    const comGeo: any[] = [];
    for (const { c, score, motivos } of ranqueados) {
      const dist = params.lat != null && params.lon != null ? distanciaKm(params.lat, params.lon, c.latitude, c.longitude) : null;
      if (params.lat != null && dist != null && dist > raio * 2) continue; // filtro amplo; ordena por proximidade
      const grau = c._count.origens + c._count.alvos;
      let s = score + Math.min(0.5, grau * 0.05);
      const ex: string[] = [...motivos];
      if (dist != null) {
        s += Math.max(0, 0.5 - dist / 200); // quanto mais perto, maior boost (max 0.5)
        if (dist <= raio) ex.push(`está a ${dist <= 1 ? 'menos de 1 km' : `${dist.toFixed(0)} km`} de você`);
      }
      if (grau > 0) ex.push(`tem ${grau} conexão(ões) verificada(s) no grafo`);
      comGeo.push({ entidade: c, score: s, motivos: ex.length ? ex.slice(0, 3) : ['entidade do diretório'] });
    }

    comGeo.sort((a, b) => b.score - a.score);
    const top = comGeo.slice(0, limit);

    // Enriquecer com relacionamentos de 1º grau para contexto (compacto).
    // BATCH: uma única query para todos os IDs do top, sem loop N+1.
    const topIds = top.map((item) => item.entidade.id);

    const todosRels = topIds.length > 0
      ? await this.prisma.graphRelacionamento.findMany({
          where: {
            status: GraphStatus.VERIFICADO,
            deletedAt: null,
            OR: [
              { origemEntidadeId: { in: topIds } },
              { alvoEntidadeId: { in: topIds } },
            ],
          },
          include: {
            origemEntidade: { select: { id: true, entidadeTipo: true, nome: true } },
            alvoEntidade: { select: { id: true, entidadeTipo: true, nome: true } },
          },
        })
      : [];

    // Group by entity id, cap at 6 connections per entity
    const relsPorEntidade = new Map<string, typeof todosRels>();
    for (const r of todosRels) {
      for (const eId of [r.origemEntidadeId, r.alvoEntidadeId]) {
        if (!topIds.includes(eId)) continue;
        const arr = relsPorEntidade.get(eId) ?? [];
        if (arr.length < 6) arr.push(r);
        relsPorEntidade.set(eId, arr);
      }
    }

    const resultados = top.map((item) => {
      const rels = relsPorEntidade.get(item.entidade.id) ?? [];
      return {
        entidade: {
          id: item.entidade.id,
          entidadeTipo: item.entidade.entidadeTipo,
          entidadeId: item.entidade.entidadeId,
          nome: item.entidade.nome,
          slug: item.entidade.slug,
          cidade: item.entidade.cidade,
          estado: item.entidade.estado,
          latitude: item.entidade.latitude,
          longitude: item.entidade.longitude,
          tags: item.entidade.tags,
          grau: item.entidade._count.origens + item.entidade._count.alvos,
        },
        score: Math.round(item.score * 100) / 100,
        motivos: item.motivos,
        conexoes: rels.map((r) => ({
          tipo: r.tipo,
          rotulo: ROTULO_POR_TIPO[r.tipo] ?? r.tipo,
          com:
            r.origemEntidadeId === item.entidade.id
              ? { nome: r.alvoEntidade.nome, tipo: r.alvoEntidade.entidadeTipo }
              : { nome: r.origemEntidade.nome, tipo: r.origemEntidade.entidadeTipo },
        })),
      };
    });

    return {
      consulta: q,
      total: resultados.length,
      resultados,
      observacao:
        q
          ? 'Busca híbrida combinando texto, localização e relações do grafo.'
          : 'Resultados ordenados por relevância e conexões no grafo.',
    };
  }

  // =================================================================
  //  RECOMENDAÇÃO EXPLICÁVEL (heurística local; sem inferir atributos sensíveis)
  // =================================================================

  async recomendar(params: {
    tipo?: GraphEntidadeTipo;
    interesse?: string;
    estado?: string;
    cidade?: string;
    lat?: number;
    lon?: number;
    raio?: number;
    limit?: number;
  }) {
    const limit = Math.min(params.limit ?? 12, 50);
    const raio = params.raio ?? 80;

    const where: any = { visivel: true, deletedAt: null };
    if (params.tipo) where.entidadeTipo = params.tipo;
    if (params.estado) where.estado = params.estado;
    if (params.cidade) where.cidade = { contains: params.cidade, mode: 'insensitive' };

    const entidades = await this.prisma.graphEntidade.findMany({
      where,
      include: {
        _count: {
          select: {
            origens: { where: { status: GraphStatus.VERIFICADO, deletedAt: null } },
            alvos: { where: { status: GraphStatus.VERIFICADO, deletedAt: null } },
          },
        },
      },
      take: 500,
    });

    const interesse = params.interesse ? normalizar(params.interesse) : '';
    const scored = [];
    for (const e of entidades) {
      const grau = e._count.origens + e._count.alvos;
      const dist = params.lat != null && params.lon != null ? distanciaKm(params.lat, params.lon, e.latitude, e.longitude) : null;
      if (params.lat != null && dist != null && dist > raio) continue;

      let score = 0;
      const motivos: string[] = [];

      if (interesse) {
        const sim = Math.max(similaridade(e.nome, interesse), similaridade((e.descricaoCurta ?? ''), interesse));
        const tagHit = (e.tags || []).some((tag) => normalizar(tag).includes(interesse));
        if (sim >= 0.3) {
          score += sim * 0.8;
          motivos.push(`corresponde ao seu interesse em "${params.interesse}"`);
        }
        if (tagHit) {
          score += 0.5;
          motivos.push('relacionado a uma tag do seu interesse');
        }
      }

      if (dist != null) {
        score += Math.max(0, 0.5 - dist / 300);
        if (dist <= raio) motivos.push(`fica a ${dist <= 1 ? 'menos de 1 km' : `${dist.toFixed(0)} km`} da sua região`);
      }

      if (grau > 0) {
        score += Math.min(0.6, grau * 0.04);
        motivos.push(`é bem conectado no grafo (${grau} relações verificadas)`);
      }

      if (!interesse && dist == null) {
        score = grau > 0 ? 0.4 : 0.1;
        motivos.push(grau > 0 ? `relevante pelo destaque no diretório (${grau} conexões)` : 'participa do diretório cultural');
      }

      scored.push({
        entidade: {
          id: e.id,
          entidadeTipo: e.entidadeTipo,
          entidadeId: e.entidadeId,
          nome: e.nome,
          slug: e.slug,
          cidade: e.cidade,
          estado: e.estado,
          latitude: e.latitude,
          longitude: e.longitude,
        },
        score: score + Math.min(0.2, grau * 0.01),
        motivos: motivos.length ? motivos.slice(0, 2) : ['recomendação com base na relevância geral'],
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return {
      tipo: params.tipo ?? null,
      limite: limit,
      recomendacoes: scored.slice(0, limit),
      explicacao: 'Recomendações explicáveis baseadas em interesses declarados, localização e conexões públicas do Axé Graph.',
    };
  }

  // =================================================================
  //  VIZINHANÇA / SUBGRAFO (para o visualizador)
  // =================================================================

  private async carregarEntidade(tipo: GraphEntidadeTipo, id: string) {
    const entidade = id.includes('-')
      ? await this.prisma.graphEntidade.findUnique({ where: { id } })
      : await this.prisma.graphEntidade.findFirst({ where: { entidadeTipo: tipo, entidadeId: id } });
    if (!entidade) throw new NotFoundException('Entidade do grafo não encontrada');
    return entidade;
  }

  async vizinhanca(tipo: GraphEntidadeTipo, id: string, profundidade = 1, apenasVerificados = true) {
    const raiz = await this.carregarEntidade(tipo, id);

    const statusFilter = apenasVerificados ? { status: GraphStatus.VERIFICADO, deletedAt: null } : { deletedAt: null };
    const rels = await this.prisma.graphRelacionamento.findMany({
      where: {
        ...statusFilter,
        OR: [{ origemEntidadeId: raiz.id }, { alvoEntidadeId: raiz.id }],
      },
      include: {
        origemEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true, cidade: true, estado: true } },
        alvoEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true, cidade: true, estado: true } },
      },
      take: 500,
    });

    const nodes = new Map<string, any>();
    nodes.set(raiz.id, {
      id: raiz.id,
      entidadeId: raiz.entidadeId,
      entidadeTipo: raiz.entidadeTipo,
      nome: raiz.nome,
      cidade: raiz.cidade,
      estado: raiz.estado,
      isRaiz: true,
      emoji: GRAOS_TIPOS[raiz.entidadeTipo]?.emoji ?? '•',
    });

    const edges: any[] = [];
    for (const r of rels) {
      const a = r.origemEntidade;
      const b = r.alvoEntidade;
      if (!nodes.has(a.id)) {
        nodes.set(a.id, { id: a.id, entidadeId: a.entidadeId, entidadeTipo: a.entidadeTipo, nome: a.nome, cidade: a.cidade, estado: a.estado, isRaiz: false, emoji: GRAOS_TIPOS[a.entidadeTipo]?.emoji ?? '•' });
      }
      if (!nodes.has(b.id)) {
        nodes.set(b.id, { id: b.id, entidadeId: b.entidadeId, entidadeTipo: b.entidadeTipo, nome: b.nome, cidade: b.cidade, estado: b.estado, isRaiz: false, emoji: GRAOS_TIPOS[b.entidadeTipo]?.emoji ?? '•' });
      }
      edges.push({
        id: r.id,
        tipo: r.tipo,
        rotulo: ROTULO_POR_TIPO[r.tipo] ?? r.tipo,
        status: r.status,
        de: a.id,
        para: b.id,
      });
    }

    if (profundidade > 1) {
      const idsVizinhos = new Set(rels.map((r) => (r.origemEntidadeId === raiz.id ? r.alvoEntidadeId : r.origemEntidadeId)));
      if (idsVizinhos.size) {
        const rels2 = await this.prisma.graphRelacionamento.findMany({
          where: {
            ...statusFilter,
            OR: [
              { origemEntidadeId: { in: [...idsVizinhos] }, alvoEntidadeId: { not: raiz.id } },
              { alvoEntidadeId: { in: [...idsVizinhos] }, origemEntidadeId: { not: raiz.id } },
            ],
          },
          include: {
            origemEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true } },
            alvoEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true } },
          },
          take: 800,
        });
        for (const r of rels2) {
          nodes.set(r.origemEntidade.id, { id: r.origemEntidade.id, entidadeId: r.origemEntidade.entidadeId, entidadeTipo: r.origemEntidade.entidadeTipo, nome: r.origemEntidade.nome, isRaiz: false, emoji: GRAOS_TIPOS[r.origemEntidade.entidadeTipo]?.emoji ?? '•' });
          nodes.set(r.alvoEntidade.id, { id: r.alvoEntidade.id, entidadeId: r.alvoEntidade.entidadeId, entidadeTipo: r.alvoEntidade.entidadeTipo, nome: r.alvoEntidade.nome, isRaiz: false, emoji: GRAOS_TIPOS[r.alvoEntidade.entidadeTipo]?.emoji ?? '•' });
          edges.push({
            id: r.id, tipo: r.tipo, rotulo: ROTULO_POR_TIPO[r.tipo] ?? r.tipo, status: r.status, de: r.origemEntidadeId, para: r.alvoEntidadeId,
          });
        }
      }
    }

    return {
      raiz: { id: raiz.id, entidadeTipo: raiz.entidadeTipo, entidadeId: raiz.entidadeId, nome: raiz.nome },
      nos: [...nodes.values()],
      arestas: edges,
      totalRelacionamentos: edges.length,
      apenasVerificados,
    };
  }

  // =================================================================
  //  RELACIONAMENTOS (com moderação, proveniência e histórico)
  // =================================================================

  async criarRelacionamento(
    dto: {
      origemTipo: GraphEntidadeTipo;
      origemId: string;
      alvoTipo: GraphEntidadeTipo;
      alvoId: string;
      tipo: GraphRelacionamentoTipo;
      fonte?: GraphFonte;
      evidencia?: string;
      rotulo?: string;
      validoDe?: string;
      validoAte?: string;
    },
    usuarioId?: string,
    comoAdmin = false,
  ) {
    if (!dto.tipo || !dto.origemTipo || !dto.alvoTipo) {
      throw new BadRequestException('tipo, origemTipo e alvoTipo são obrigatórios');
    }
    if (dto.origemTipo === dto.alvoTipo && dto.origemId === dto.alvoId) {
      throw new BadRequestException('Uma entidade não pode se relacionar consigo mesma');
    }

    const [origem, alvo] = await Promise.all([
      this.carregarEntidade(dto.origemTipo, dto.origemId),
      this.carregarEntidade(dto.alvoTipo, dto.alvoId),
    ]);
    if (!origem.visivel || !alvo.visivel) throw new BadRequestException('Uma das entidades está indisponível');

    const fonte = dto.fonte ?? GraphFonte.USUARIO;
    const status = comoAdmin || fonte === GraphFonte.ADMIN ? GraphStatus.VERIFICADO : GraphStatus.PENDENTE;

    const existente = await this.prisma.graphRelacionamento.findFirst({
      where: { tipo: dto.tipo, origemEntidadeId: origem.id, alvoEntidadeId: alvo.id, deletedAt: null },
    });
    // Se existir um pendente/rejeitado, a criação reutiliza
    const rel = existente
      ? await this.prisma.graphRelacionamento.update({
          where: { id: existente.id },
          data: {
            status,
            fonte,
            evidencia: dto.evidencia ?? existente.evidencia,
            rotulo: dto.rotulo ?? existente.rotulo,
            validoDe: dto.validoDe ? new Date(dto.validoDe) : existente.validoDe,
            validoAte: dto.validoAte ? new Date(dto.validoAte) : existente.validoAte,
            versao: { increment: 1 },
            deletedAt: null,
          },
        })
      : await this.prisma.graphRelacionamento.create({
          data: {
            tipo: dto.tipo,
            rotulo: dto.rotulo,
            status,
            fonte,
            nivelConfianca: CONFIANCA_POR_FONTE[fonte] ?? 0.3,
            evidencia: dto.evidencia,
            validoDe: dto.validoDe ? new Date(dto.validoDe) : null,
            validoAte: dto.validoAte ? new Date(dto.validoAte) : null,
            origemEntidadeId: origem.id,
            alvoEntidadeId: alvo.id,
            criadoPorId: usuarioId ?? null,
          },
        });

    await this.prisma.graphRelacionamentoHistorico.create({
      data: {
        relacionamentoId: rel.id,
        versao: rel.versao,
        acao: existente ? 'ATUALIZADO' : 'CRIADO',
        depois: { tipo: dto.tipo, status, fonte, origem: origem.nome, alvo: alvo.nome },
        porId: usuarioId ?? null,
      },
    });

    return {
      relacionamento: rel,
      status,
      moderacao: status === GraphStatus.PENDENTE
        ? 'Relacionamento criado. Aguardando revisão da moderação para ficar público.'
        : 'Relacionamento criado e já verificado.',
    };
  }

  async listarRelacionamentos(params: { tipo?: GraphRelacionamentoTipo; status?: GraphStatus; origemTipo?: string; origemId?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (params.tipo) where.tipo = params.tipo;
    if (params.status) where.status = params.status;
    else where.status = GraphStatus.VERIFICADO;
    if (params.origemTipo && params.origemId) {
      const e = await this.prisma.graphEntidade.findFirst({
        where: { entidadeTipo: params.origemTipo as any, entidadeId: params.origemId },
      });
      if (e) {
        where.OR = [{ origemEntidadeId: e.id }, { alvoEntidadeId: e.id }];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.graphRelacionamento.findMany({
        where,
        include: {
          origemEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true, cidade: true, estado: true } },
          alvoEntidade: { select: { id: true, entidadeTipo: true, entidadeId: true, nome: true, cidade: true, estado: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: params.offset ?? 0,
        take: Math.min(params.limit ?? 50, 100),
      }),
      this.prisma.graphRelacionamento.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        id: r.id, tipo: r.tipo, rotulo: ROTULO_POR_TIPO[r.tipo] ?? r.rotulo ?? r.tipo, status: r.status,
        nivelConfianca: r.nivelConfianca, fonte: r.fonte, evidencia: r.evidencia,
        validoDe: r.validoDe, validoAte: r.validoAte, criadoEm: r.createdAt,
        origem: r.origemEntidade, alvo: r.alvoEntidade,
      })),
      total,
    };
  }

  async meusRelacionamentosPendentes(usuarioId: string) {
    return this.prisma.graphRelacionamento.findMany({
      where: { criadoPorId: usuarioId, deletedAt: null },
      include: {
        origemEntidade: { select: { nome: true, entidadeTipo: true, entidadeId: true } },
        alvoEntidade: { select: { nome: true, entidadeTipo: true, entidadeId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revisarRelacionamento(id: string, decisao: 'VERIFICAR' | 'REJEITAR' | 'SUSPENDER', usuarioId: string) {
    const rel = await this.prisma.graphRelacionamento.findUnique({ where: { id } });
    if (!rel) throw new NotFoundException('Relacionamento não encontrado');

    const data: any = {};
    let acao = 'ATUALIZADO';
    if (decisao === 'VERIFICAR') {
      data.status = GraphStatus.VERIFICADO;
      data.verificadoPorId = usuarioId;
      data.verificadoEm = new Date();
      data.nivelConfianca = Math.min(1, (rel.nivelConfianca ?? 0) + 0.4);
      acao = 'VERIFICADO';
    } else if (decisao === 'REJEITAR') {
      data.status = GraphStatus.REJEITADO;
      data.rejeitadoPorId = usuarioId;
      data.nivelConfianca = 0;
      acao = 'REJEITADO';
    } else {
      data.status = GraphStatus.SUSPENSO;
      data.rejeitadoPorId = usuarioId;
      acao = 'SUSPENSO';
    }

    const atualizado = await this.prisma.graphRelacionamento.update({
      where: { id },
      data: { ...data, versao: { increment: 1 } },
    });

    await this.prisma.graphRelacionamentoHistorico.create({
      data: {
        relacionamentoId: id,
        versao: atualizado.versao,
        acao,
        antes: { status: rel.status },
        depois: { status: atualizado.status },
        porId: usuarioId,
      },
    });

    return atualizado;
  }

  async historicoRelacionamento(id: string) {
    const rel = await this.prisma.graphRelacionamento.findUnique({ where: { id } });
    if (!rel) throw new NotFoundException('Relacionamento não encontrado');
    const historico = await this.prisma.graphRelacionamentoHistorico.findMany({
      where: { relacionamentoId: id },
      include: { por: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { relacionamento: rel, historico };
  }

  async removerRelacionamento(id: string, usuarioId: string) {
    const rel = await this.prisma.graphRelacionamento.findUnique({ where: { id } });
    if (!rel) throw new NotFoundException('Relacionamento não encontrado');
    await this.prisma.graphRelacionamento.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.graphRelacionamentoHistorico.create({
      data: { relacionamentoId: id, versao: rel.versao + 1, acao: 'DELETADO', antes: { status: rel.status }, porId: usuarioId },
    });
    return { ok: true };
  }

  // =================================================================
  //  ENTITY RESOLUTION (duplicidades — sem consolidação automática)
  // =================================================================

  async detectarDuplicidades() {
    const entidades = await this.prisma.graphEntidade.findMany({
      where: { visivel: true, deletedAt: null },
      select: { id: true, entidadeTipo: true, entidadeId: true, nome: true, cidade: true, estado: true },
      take: 3000,
    });

    const porTipo = new Map<string, typeof entidades>();
    for (const e of entidades) {
      const arr = porTipo.get(e.entidadeTipo) ?? [];
      arr.push(e);
      porTipo.set(e.entidadeTipo, arr);
    }

    let criadas = 0;
    for (const grupo of porTipo.values()) {
      for (let i = 0; i < grupo.length; i++) {
        for (let j = i + 1; j < grupo.length; j++) {
          const a = grupo[i];
          const b = grupo[j];
          if (a.id === b.id) continue;
          const score = similaridade(a.nome, b.nome);
          const mesmaCidade = a.cidade && b.cidade ? normalizar(a.cidade) === normalizar(b.cidade) : false;
          const mesmoEstado = a.estado && b.estado && a.estado === b.estado;
          if (score >= 0.65 && (mesmaCidade || mesmoEstado)) {
            const existe = await this.prisma.graphCandidatoDuplicidade.findFirst({
              where: {
                entidadeTipo: a.entidadeTipo,
                OR: [
                  { entidadeIdA: a.entidadeId, entidadeIdB: b.entidadeId },
                  { entidadeIdA: b.entidadeId, entidadeIdB: a.entidadeId },
                ],
              },
            });
            if (!existe) {
              await this.prisma.graphCandidatoDuplicidade.create({
                data: {
                  entidadeTipo: a.entidadeTipo,
                  entidadeIdA: a.entidadeId,
                  entidadeIdB: b.entidadeId,
                  score: Math.round(score * 100) / 100,
                  motivo: `Nomes semelhantes (${(score * 100).toFixed(0)}%)${mesmaCidade ? ' na mesma cidade' : ''}${mesmoEstado ? ` em ${a.estado}` : ''}.`,
                  status: DuplicidadeStatus.ABERTO,
                },
              });
              criadas++;
            }
          }
        }
      }
    }

    const pendentes = await this.prisma.graphCandidatoDuplicidade.count({ where: { status: DuplicidadeStatus.ABERTO } });
    return { novasCandidaturas: criadas, totalPendentes: pendentes };
  }

  async listarDuplicidades(status?: DuplicidadeStatus) {
    return this.prisma.graphCandidatoDuplicidade.findMany({
      where: status ? { status } : {},
      include: { criadoPor: { select: { id: true, nome: true } }, resolvidoPor: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async resolverDuplicidade(id: string, dto: { decisao: 'CONFIRMAR' | 'REJEITAR'; entidadeCanonicaId?: string }, usuarioId: string) {
    const dup = await this.prisma.graphCandidatoDuplicidade.findUnique({ where: { id } });
    if (!dup) throw new NotFoundException('Candidatura de duplicidade não encontrada');
    if (dup.status !== DuplicidadeStatus.ABERTO) throw new ConflictException('Duplicidade já resolvida');

    const status = dto.decisao === 'CONFIRMAR' ? DuplicidadeStatus.CONFIRMADO : DuplicidadeStatus.REJEITADO;

    await this.prisma.graphCandidatoDuplicidade.update({
      where: { id },
      data: { status, resolvidoPorId: usuarioId, resolvidoEm: new Date() },
    });

    if (dto.decisao === 'CONFIRMAR') {
      // MVP: não consolida automaticamente. Apenas sinaliza as entidades como duplicadas
      // (ocultação/disponibilidade da canônica fica à cargo do admin).
      const alvo = dto.entidadeCanonicaId
        ? dup.entidadeIdA === dto.entidadeCanonicaId
          ? dup.entidadeIdB
          : dup.entidadeIdA
        : dup.entidadeIdB;
      if (alvo) {
        await this.prisma.graphEntidade.updateMany({
          where: { entidadeTipo: dup.entidadeTipo, entidadeId: alvo },
          data: { visivel: false, statusIndexado: 'INATIVO' },
        });
      }
    }

    return { status, decisao: dto.decisao };
  }

  // =================================================================
  //  CULTURA E MEMÓRIA (conteúdo com fonte, autor, licença e verificação)
  // =================================================================

  async criarConteudoCultural(dto: any, usuarioId: string) {
    if (!dto.titulo || !dto.tipo) throw new BadRequestException('titulo e tipo são obrigatórios');
    return this.prisma.conteudoCultural.create({
      data: {
        titulo: dto.titulo,
        tipo: dto.tipo,
        resumo: dto.resumo ?? null,
        corpo: dto.corpo ?? null,
        url: dto.url ?? null,
        autorNome: dto.autorNome ?? null,
        fonte: dto.fonte ?? null,
        dataPublicacao: dto.dataPublicacao ? new Date(dto.dataPublicacao) : null,
        licenca: dto.licenca ?? null,
        origem: dto.origem ?? null,
        thumbUrl: dto.thumbUrl ?? null,
        tags: dto.tags ?? [],
        status: dto.status ?? ConteudoStatus.NAO_VERIFICADA,
        cidade: dto.cidade ?? null,
        estado: dto.estado ?? null,
        terreiroId: dto.terreiroId ?? null,
        instituicaoId: dto.instituicaoId ?? null,
        criadoPorId: usuarioId,
      },
    });
  }

  async listarConteudosCulturais(params: { tipo?: string; status?: ConteudoStatus; q?: string; limit?: number; offset?: number }) {
    const soPublico = !params.status;
    const where: any = {
      deletedAt: null,
      ...(soPublico
        ? { status: { in: [ConteudoStatus.VERIFICADA, ConteudoStatus.OFICIAL] }, nivelPrivacidade: NivelPrivacidade.PUBLICO }
        : { status: params.status }),
    };
    if (params.tipo) where.tipo = params.tipo;
    if (params.q) {
      where.OR = [
        { titulo: { contains: params.q, mode: 'insensitive' } },
        { resumo: { contains: params.q, mode: 'insensitive' } },
        { autorNome: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.conteudoCultural.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.offset ?? 0,
        take: Math.min(params.limit ?? 40, 100),
      }),
      this.prisma.conteudoCultural.count({ where }),
    ]);
    return { data, total };
  }

  async revisarConteudoCultural(id: string, dto: { status?: ConteudoStatus; verificado?: boolean }, usuarioId: string) {
    const c = await this.prisma.conteudoCultural.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Conteúdo cultural não encontrado');
    if (dto.verificado || dto.status) {
      const status = dto.status ?? ConteudoStatus.VERIFICADA;
      return this.prisma.conteudoCultural.update({
        where: { id },
        data: { status, verificadoPorId: usuarioId, verificadoEm: new Date() },
      });
    }
    return c;
  }

  async listarPatrimonios(params: { estado?: string; cidade?: string; q?: string; limit?: number }) {
    const where: any = { deletedAt: null, nivelPrivacidade: NivelPrivacidade.PUBLICO };
    if (params.estado) where.estado = params.estado;
    if (params.cidade) where.cidade = { contains: params.cidade, mode: 'insensitive' };
    if (params.q) where.nome = { contains: params.q, mode: 'insensitive' };
    return this.prisma.patrimonioCultural.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(params.limit ?? 50, 100),
    });
  }

  async criarPatrimonio(dto: any, usuarioId: string) {
    if (!dto.nome) throw new BadRequestException('nome é obrigatório');
    return this.prisma.patrimonioCultural.create({
      data: {
        nome: dto.nome,
        tipo: dto.tipo ?? 'HISTORICO',
        descricao: dto.descricao ?? null,
        cidade: dto.cidade ?? null,
        estado: dto.estado ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        ano: dto.ano ?? null,
        fonte: dto.fonte ?? null,
        status: dto.status ?? ConteudoStatus.NAO_VERIFICADA,
        fotos: dto.fotos ?? [],
        criadoPorId: usuarioId,
      },
    });
  }

  // =================================================================
  //  ROTAS / CIRCUITOS CULTURAIS (roteiro sugerido a partir de dados reais)
  // =================================================================

  async rotasCulturais(params: { cidade?: string; estado?: string; dias?: number; lat?: number; lon?: number; raio?: number }) {
    const dias = Math.min(Math.max(params.dias ?? 1, 1), 5);
    const raio = params.raio ?? 60;

    const eventos = await this.prisma.eventos.findMany({
      where: {
        deletedAt: null,
        isPublico: true,
        dataInicio: { gte: new Date() },
        ...(params.cidade ? { terreiro: { cidade: { contains: params.cidade, mode: 'insensitive' } } } : {}),
      },
      select: {
        id: true, titulo: true, dataInicio: true, dataFim: true, tipo: true,
        terreiro: { select: { nome: true, slug: true, cidade: true, estado: true, latitude: true, longitude: true } },
      },
      orderBy: { dataInicio: 'asc' },
      take: 60,
    });

    let filtrados = eventos;
    if (params.lat != null && params.lon != null) {
      filtrados = eventos.filter((e) => {
        const d = distanciaKm(params.lat!, params.lon!, e.terreiro.latitude, e.terreiro.longitude);
        return d == null || d <= raio;
      });
    }

    const terreirosDoRoteiro = filtrados
      .map((e) => e.terreiro)
      .filter((t, i, arr) => arr.findIndex((x) => x.slug === t.slug) === i)
      .slice(0, Math.max(2, dias));

    const patrimonio = await this.prisma.patrimonioCultural.findMany({
      where: { ...(params.estado ? { estado: params.estado } : {}), nivelPrivacidade: NivelPrivacidade.PUBLICO },
      take: 8,
    });

    const conteudosRoteiro: any[] = [];
    const cidadesRoteiro = [...new Set(terreirosDoRoteiro.map((t) => t.cidade).filter(Boolean))];
    if (cidadesRoteiro.length) {
      const conteudos = await this.prisma.conteudoCultural.findMany({
        where: { deletedAt: null, cidade: { in: cidadesRoteiro }, nivelPrivacidade: NivelPrivacidade.PUBLICO },
        take: 8,
      });
      conteudosRoteiro.push(...conteudos.map((c) => ({ nome: c.titulo, cidade: c.cidade, estado: c.estado })));
    }

    return {
      roteiro: terreirosDoRoteiro.map((t, i) => ({
        dia: `Dia ${i + 1}`,
        paradas: [
          { tipo: 'TERREIRO', nome: t.nome, slug: t.slug, cidade: t.cidade, estado: t.estado },
          ...filtrados.filter((e) => e.terreiro.slug === t.slug).map((e) => ({ tipo: 'EVENTO', nome: e.titulo, data: e.dataInicio })),
        ],
      })),
      conteudos: conteudosRoteiro.slice(0, 5),
      patrimonio: patrimonio.slice(0, 5),
      aviso: 'Roteiro sugerido a partir de dados públicos. Respeite as regras de visitação e autorização de cada espaço.',
    };
  }

  // =================================================================
  //  MÉTRICAS DO AXÉ GRAPH (observabilidade / governança)
  // =================================================================

  async estatisticas() {
    const [entidades, entidadesPorTipo, relacionamentos, porStatus, verificados, pendentes, duplicidadesAbertas, conteudos, patrimonio] = await Promise.all([
      this.prisma.graphEntidade.count({ where: { deletedAt: null } }),
      this.prisma.graphEntidade.groupBy({ by: ['entidadeTipo'], where: { deletedAt: null }, _count: true }),
      this.prisma.graphRelacionamento.count({ where: { deletedAt: null } }),
      this.prisma.graphRelacionamento.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      this.prisma.graphRelacionamento.count({ where: { status: GraphStatus.VERIFICADO, deletedAt: null } }),
      this.prisma.graphRelacionamento.count({ where: { status: GraphStatus.PENDENTE, deletedAt: null } }),
      this.prisma.graphCandidatoDuplicidade.count({ where: { status: DuplicidadeStatus.ABERTO } }),
      this.prisma.conteudoCultural.count({ where: { deletedAt: null } }),
      this.prisma.patrimonioCultural.count({ where: { deletedAt: null } }),
    ]);

    return {
      entidades,
      entidadesPorTipo: Object.fromEntries(entidadesPorTipo.map((e) => [e.entidadeTipo, e._count])),
      relacionamentos,
      relacionamentosPorStatus: Object.fromEntries(porStatus.map((e) => [e.status, e._count])),
      relacionamentosVerificados: verificados,
      relacionamentosPendentes: pendentes,
      duplicidadesAbertas: duplicidadesAbertas,
      conteudosCulturais: conteudos,
      patrimonio: patrimonio,
      confiancaMedianaRelacionamento: null,
      observacao: 'Métricas calculadas em tempo real sobre o Axé Graph.',
    };
  }
}