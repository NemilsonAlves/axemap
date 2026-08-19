import { describe, expect, it } from 'vitest';
import { COUNTRIES, WORLD_CODE, countryByCode, countryName } from './countries';

describe('countries', () => {
  it('expõe os 7 países alvo da cobertura', () => {
    for (const code of ['BR', 'US', 'FR', 'PT', 'NG', 'CU', 'HT']) {
      expect(countryByCode(code)).toBeDefined();
    }
  });

  it('nome do país é traduzível', () => {
    expect(countryName(countryByCode('BR'), 'pt-BR')).toMatch(/Brasil/i);
    expect(countryName(countryByCode('FR'), 'fr')).toMatch(/France/i);
  });

  it('cada país sugere pelo menos um idioma', () => {
    for (const c of COUNTRIES) {
      expect(c.suggestedLocales.length).toBeGreaterThan(0);
    }
  });

  it('WORLD é o fallback', () => {
    const world = countryByCode(WORLD_CODE);
    expect(world).toBeDefined();
    expect(world.code).toBe(WORLD_CODE);
    expect(world.currency).toBe('');
  });
});