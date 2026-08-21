import { describe, expect, it } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('converte "Casa de Axé São João" para "casa-de-axe-sao-joao"', () => {
    expect(generateSlug('Casa de Axé São João')).toBe('casa-de-axe-sao-joao');
  });

  it('converte "Terreiro de Iansã" para "terreiro-de-iansa"', () => {
    expect(generateSlug('Terreiro de Iansã')).toBe('terreiro-de-iansa');
  });

  it('converte "Axé & Cultura" para "axe-cultura"', () => {
    expect(generateSlug('Axé & Cultura')).toBe('axe-cultura');
  });

  it('remove espaços extras', () => {
    expect(generateSlug('  Casa   de   Axé  ')).toBe('casa-de-axe');
  });

  it('converte "São José d\'África" para slug normalizado', () => {
    expect(generateSlug("São José d'África")).toBe('sao-jose-dafrica');
  });

  it('remove todos os diacríticos', () => {
    expect(generateSlug('ÁÉÍÓÚÃÕÇ')).toBe('aeiouaoc');
  });

  it('colapsa múltiplos hífens', () => {
    expect(generateSlug('a---b---c')).toBe('a-b-c');
  });

  it('remove hífens do início e fim', () => {
    expect(generateSlug('-hello-')).toBe('hello');
  });

  it('retorna fallback para string vazia', () => {
    expect(generateSlug('')).toBe('item');
  });

  it('retorna fallback para valor não-string', () => {
    expect(generateSlug(null as any)).toBe('item');
    expect(generateSlug(undefined as any)).toBe('item');
    expect(generateSlug(123 as any)).toBe('item');
  });

  it('usa fallback customizado', () => {
    expect(generateSlug('', 'campanha')).toBe('campanha');
    expect(generateSlug('!!!', 'evento')).toBe('evento');
  });

  it('remove caracteres especiais', () => {
    expect(generateSlug('Hello @ World # $ %')).toBe('hello-world');
  });

  it('preserva números', () => {
    expect(generateSlug('Casa 123')).toBe('casa-123');
  });

  it('lida com apenas espaços', () => {
    expect(generateSlug('   ')).toBe('item');
  });

  it('lida com apenas caracteres especiais', () => {
    expect(generateSlug('!@#$%^&*()')).toBe('item');
  });

  it('slug realista: Ilê Axé Omim Odé', () => {
    expect(generateSlug('Ilê Axé Omim Odé')).toBe('ile-axe-omim-ode');
  });

  it('slug realista: Terreiro de Santa Bárbara', () => {
    expect(generateSlug('Terreiro de Santa Bárbara')).toBe('terreiro-de-santa-barbara');
  });
});
