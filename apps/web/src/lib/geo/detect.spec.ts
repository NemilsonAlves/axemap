import { describe, expect, it } from 'vitest';
import {
  detectCountry,
  detectLocale,
  localeFromBrowserLanguage,
} from './detect';
import { countryByCode } from './countries';

describe('detectCountry', () => {
  it('preferência manual vence tudo', () => {
    expect(detectCountry({ preference: 'US', requestCountry: 'BR', timezone: 'america/sao_paulo' }).code).toBe('US');
    expect(detectCountry({ preference: 'HT' }).code).toBe('HT');
  });

  it('país do request é usado quando não há preferência', () => {
    expect(detectCountry({ requestCountry: 'FR' }).code).toBe('FR');
    expect(detectCountry({ requestCountry: 'NG' }).code).toBe('NG');
  });

  it('timezone infere o país', () => {
    expect(detectCountry({ timezone: 'europe/lisbon' }).code).toBe('PT');
    expect(detectCountry({ timezone: 'america/havana' }).code).toBe('CU');
  });

  it('idioma do navegador infere o país', () => {
    expect(detectCountry({ browserLanguage: 'pt-BR' }).code).toBe('BR');
    expect(detectCountry({ browserLanguage: 'fr-FR' }).code).toBe('FR');
  });

  it('fallback padrão é BR (produto centrado no Brasil)', () => {
    expect(detectCountry({}).code).toBe('BR');
    expect(detectCountry({ defaultCode: 'WORLD' }).code).toBe('WORLD');
  });

  it('request inválido não vaza', () => {
    expect(detectCountry({ requestCountry: 'XX' }).code).toBe('BR');
    expect(detectCountry({ requestCountry: 'XX', defaultCode: 'WORLD' }).code).toBe('WORLD');
  });
});

describe('detectLocale', () => {
  it('preferência persistida vence', () => {
    expect(detectLocale({ preference: 'yo', browserLanguage: 'en-US' })).toBe('yo');
  });

  it('seleção manual da sessão vence', () => {
    expect(detectLocale({ manual: 'fr', browserLanguage: 'pt-BR' })).toBe('fr');
  });

  it('idioma do navegador vem antes do país', () => {
    expect(detectLocale({ browserLanguage: 'es-ES', country: countryByCode('BR') })).toBe('es');
    expect(detectLocale({ browserLanguage: 'en-US', country: countryByCode('BR') })).toBe('en');
  });

  it('país sugere o idioma quando não há pista do navegador', () => {
    expect(detectLocale({ country: countryByCode('FR') })).toBe('fr');
    expect(detectLocale({ country: countryByCode('NG') })).toBe('en');
  });

  it('fallback é pt-BR', () => {
    expect(detectLocale({})).toBe('pt-BR');
  });

  it('nunca devolve um idioma falso/não suportado', () => {
    const r = detectLocale({ browserLanguage: 'de-DE', country: countryByCode('BR') });
    expect(['pt-BR', 'pt-PT', 'en', 'es', 'fr', 'yo']).toContain(r);
  });
});

describe('localeFromBrowserLanguage', () => {
  it('mapeia idiomas suportados', () => {
    expect(localeFromBrowserLanguage('pt-BR')).toBe('pt-BR');
    expect(localeFromBrowserLanguage('pt-PT')).toBe('pt-PT');
    expect(localeFromBrowserLanguage('fr-FR')).toBe('fr');
    expect(localeFromBrowserLanguage('yo-NG')).toBe('yo');
  });

  it('desconhecido cai para pt-BR', () => {
    expect(localeFromBrowserLanguage('de-DE')).toBe('pt-BR');
  });
});