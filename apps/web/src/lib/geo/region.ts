/**
 * AxéMap — Priorização geográfica (FASE 19/21/22)
 *
 * O país detectado apenas PRIORIZA visualmente a região — nunca exclui
 * o resto do mundo. Cada item (terreiro, federação, tradição, campanha)
 * pode receber um peso de "relevância regional" para ordenação.
 */

import type { Country } from './countries';

/** Regiões e países relacionados a cada país detectado (diáspora). */
const REGION_PRIORITY: Record<string, string[]> = {
  BR: ['BR', 'america-sul', 'caribe', 'africa', 'AO', 'MZ', 'PT'],
  US: ['US', 'CA', 'america-norte', 'caribe', 'HT', 'CU', 'JM', 'africa'],
  CA: ['CA', 'US', 'america-norte', 'caribe', 'africa'],
  GB: ['GB', 'europa', 'caribe', 'africa', 'NG', 'GH'],
  FR: ['FR', 'europa', 'africa', 'BJ', 'SN', 'HT', 'caribe'],
  PT: ['PT', 'europa', 'africa', 'BR', 'AO', 'MZ', 'CV'],
  ES: ['ES', 'europa', 'caribe', 'CU', 'africa'],
  NG: ['NG', 'africa', 'GH', 'BJ', 'europa', 'US'],
  GH: ['GH', 'africa', 'NG', 'BJ', 'europa'],
  BJ: ['BJ', 'africa', 'NG', 'GH', 'SN', 'FR'],
  SN: ['SN', 'africa', 'BJ', 'FR', 'europa'],
  AO: ['AO', 'africa', 'MZ', 'PT', 'BR'],
  MZ: ['MZ', 'africa', 'AO', 'PT', 'BR'],
  CU: ['CU', 'caribe', 'ES', 'US', 'HT', 'JM'],
  HT: ['HT', 'caribe', 'FR', 'US', 'CU'],
  JM: ['JM', 'caribe', 'US', 'GB', 'HT'],
  WORLD: [],
};

export function priorityOf(country: Country): string[] {
  return REGION_PRIORITY[country.code] ?? [];
}

/**
 * Calcula a prioridade regional de um item a partir de seus atributos
 * (país, continente, região). Retorna 0 = máxima prioridade.
 */
export function regionalRank(
  country: Country,
  item: {
    pais?: string | null;
    continente?: string | null;
    regiao?: string | null;
    estado?: string | null;
  },
): number {
  const priority = priorityOf(country);
  if (priority.length === 0) return 1;
  const tags = [
    item.pais?.toUpperCase(),
    item.continente,
    item.regiao,
    item.pais,
    item.estado,
  ].filter(Boolean) as string[];

  for (let i = 0; i < priority.length; i++) {
    const p = priority[i].toLowerCase();
    if (tags.some((tag) => tag.toLowerCase().includes(p))) return i;
  }
  return priority.length;
}

/** True se o item pertence ao país/região do visitante. */
export function isLocalItem(
  country: Country,
  item: { pais?: string | null; continente?: string | null; regiao?: string | null; estado?: string | null },
): boolean {
  return regionalRank(country, item) === 0;
}

/**
 * Prioridade de uma TRADIÇÃO para o visitante.
 * Usa os nomes de país em pt-BR (catálogo de tradições) contra a lista de
 * países de origem e de presença diaspórica. 0 = máxima prioridade.
 */
export function tradicaoRelevance(
  country: Country,
  tradicao: { paises: string[]; diaspora: string[]; regiao?: string },
): number {
  if (country.code === 'WORLD') return 1;
  const visitor = country.names['pt-BR'];
  if (!visitor) return 1;
  if (tradicao.paises.includes(visitor) || tradicao.diaspora.includes(visitor)) return 0;
  return 1;
}