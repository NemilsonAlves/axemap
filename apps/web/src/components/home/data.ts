import { cache } from 'react';
import { fetchDiscovery, postDiscovery } from '@/lib/seo/fetch-discovery';
import { fetchLanding } from '@/lib/seo/fetch-landing';
import type { DadosStats } from '@/lib/seo/types';

/* ── Tipos de contrato (shape das rotas da API) ──────────────── */

export interface Recomendacao {
  terreiroId: string;
  nome: string;
  slug: string;
  tradicao: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  descricaoCurta: string | null;
  fotoUrl: string | null;
  score: number;
  distanciaKm?: number;
  explicacao: string;
}

export interface EventoAlta {
  id: string;
  titulo: string;
  tipo: string;
  dataInicio: string;
  terreiroNome: string;
  terreiroSlug: string;
  cidade: string;
  estado: string;
  totalPresencas: number;
}

export interface CursoSimples {
  id: string;
  titulo: string;
  modalidade: string | null;
  dataInicio: string | null;
  terreiroNome: string;
  terreiroSlug: string;
  cidade: string;
  estado: string;
}

export interface BlocoHome {
  id: string;
  titulo: string;
  subtitulo: string;
  tipo: 'terreiros' | 'eventos' | 'cursos' | 'acoes-sociais';
  itens: any[];
  linkVerMais?: string;
}

export interface ExploreData {
  capa: Recomendacao[];
  tradicoes: Array<{ nome: string; count: number }>;
  cidades: Array<{ cidade: string; estado: string; count: number }>;
  stats: { totalTerreiro: number; totalVerificados: number; totalEventos: number };
}

export interface HomeData {
  explore: ExploreData | null;
  blocos: BlocoHome[];
  eventosAlta: EventoAlta[];
  stats: DadosStats | null;
}

export function tradicaoLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Busca única, deduplicada entre seções (mesmo fetch não repete). */
export const getHomeData = cache(async (): Promise<HomeData> => {
  const [explore, blocosRaw, eventosAlta, stats] = await Promise.all([
    fetchDiscovery<ExploreData>('/discovery/explore', 300),
    postDiscovery<BlocoHome[]>('/recommendation/home', {}, 300),
    fetchDiscovery<EventoAlta[]>('/discovery/eventos-em-alta', 300),
    fetchLanding<DadosStats>('/stats', 3600),
  ]);
  return {
    explore,
    blocos: blocosRaw || [],
    eventosAlta: eventosAlta || [],
    stats,
  };
});

/** Bloco de terreiros tipado + formatação de nomes de tradição. */
export interface TerreiroCarda {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  descricaoCurta?: string | null;
  fotoUrl?: string | null;
  explicacao?: string;
  score?: number;
}

export function blocoDe(list: BlocoHome[], id: string) {
  return list.find((b) => b.id === id);
}

export function terreirosDeCapa(data: HomeData): TerreiroCarda[] {
  const verificados = blocoDe(data.blocos, 'verificados');
  if (verificados?.itens?.length) {
    return (verificados.itens as any[]).map((r) => ({
      id: r.terreiroId ?? r.id ?? r.slug,
      nome: r.nome,
      slug: r.slug,
      tradicao: r.tradicao,
      trustScore: r.trustScore,
      isVerified: r.isVerified,
      cidade: r.cidade,
      estado: r.estado,
      descricaoCurta: r.descricaoCurta ?? null,
      fotoUrl: r.fotoUrl ?? null,
      explicacao: r.explicacao,
      score: r.score,
    }));
  }
  return (data.explore?.capa ?? []).map((r) => ({
    id: r.terreiroId ?? r.slug,
    nome: r.nome,
    slug: r.slug,
    tradicao: r.tradicao,
    trustScore: r.trustScore,
    isVerified: r.isVerified,
    cidade: r.cidade,
    estado: r.estado,
    descricaoCurta: r.descricaoCurta,
    fotoUrl: r.fotoUrl,
    explicacao: r.explicacao,
    score: r.score,
  }));
}