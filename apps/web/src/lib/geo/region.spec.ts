import { describe, expect, it } from 'vitest';
import { isLocalItem, priorityOf, regionalRank, tradicaoRelevance } from './region';
import { countryByCode } from './countries';

describe('region', () => {
  it('BR prioriza itens brasileiros', () => {
    const br = countryByCode('BR');
    expect(regionalRank(br, { pais: 'BR' })).toBe(0);
    // continente adjacente vem logo depois do país de origem
    expect(regionalRank(br, { continente: 'america-sul' })).toBe(1);
    // item africano vem depois
    expect(regionalRank(br, { pais: 'NG' })).toBeGreaterThan(1);
  });

  it('FR prioriza África francófona e Caribe', () => {
    const fr = countryByCode('FR');
    // BJ é país diretamente relacionado → aparece antes de qualquer item não relacionado
    expect(regionalRank(fr, { pais: 'BJ' })).toBeLessThan(regionalRank(fr, { pais: 'PT' }));
    expect(regionalRank(fr, { pais: 'HT' })).toBeLessThan(regionalRank(fr, { pais: 'PT' }));
  });

  it('isLocalItem marca só prioridade zero', () => {
    expect(isLocalItem(countryByCode('PT'), { pais: 'PT' })).toBe(true);
    expect(isLocalItem(countryByCode('PT'), { pais: 'US' })).toBe(false);
  });

  it('WORLD não prioriza nada', () => {
    expect(priorityOf(countryByCode('WORLD'))).toHaveLength(0);
  });

  it('país desconhecido retorna fallback', () => {
    expect(regionalRank(countryByCode('US'), { pais: 'FR' })).toBeGreaterThan(0);
  });
});

describe('tradicaoRelevance', () => {
  it('prioriza tradições do país de origem do visitante', () => {
    const br = countryByCode('BR');
    expect(tradicaoRelevance(br, { paises: ['Brasil'], diaspora: [] })).toBe(0);
    expect(tradicaoRelevance(br, { paises: ['Nigéria'], diaspora: ['Brasil'] })).toBe(0);
    expect(tradicaoRelevance(br, { paises: ['Haiti'], diaspora: [] })).toBe(1);
  });

  it('Cuba e Haiti priorizam suas tradições', () => {
    expect(tradicaoRelevance(countryByCode('CU'), { paises: ['Cuba'], diaspora: [] })).toBe(0);
    expect(tradicaoRelevance(countryByCode('HT'), { paises: ['Haiti'], diaspora: [] })).toBe(0);
  });

  it('WORLD não prioriza nada', () => {
    expect(tradicaoRelevance(countryByCode('WORLD'), { paises: ['Brasil'], diaspora: [] })).toBe(1);
  });
});