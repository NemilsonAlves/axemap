/**
 * TESTE: Location Privacy — Localização Privada não vaza
 *
 * Complementa location-visibility.spec.ts com testes de cenários de segurança
 * específicos para a proteção de comunidades (Prompt 14, seções 10–12).
 */

import { mascararLocalizacao } from '../../common/utils/location-visibility';
import { LocalizacaoVisibilidade } from '@axemap/shared';

describe('Location Privacy — Segurança de localização de comunidades', () => {
  const terreiroSensivel = {
    id: 't1',
    nome: 'Casa Sagrada',
    latitude: -23.5489,
    longitude: -46.6388,
    cidade: 'São Paulo',
    estado: 'SP',
    geoPoint: { type: 'Point', coordinates: [-46.6388, -23.5489] },
  };

  // ──────────────────────────────────────────────────────────────
  // PRIVADA: nem lat/long, nem geoPoint são expostos
  // ──────────────────────────────────────────────────────────────

  it('PRIVADA: latitude, longitude e geoPoint são removidos da resposta', () => {
    const resultado = mascararLocalizacao({
      ...terreiroSensivel,
      visibilidadeLocalizacao: LocalizacaoVisibilidade.PRIVADA,
    });

    expect(resultado.latitude).toBeUndefined();
    expect(resultado.longitude).toBeUndefined();
    expect(resultado.geoPoint).toBeUndefined();
  });

  it('PRIVADA: cidade e estado CONTINUAM visíveis', () => {
    const resultado = mascararLocalizacao({
      ...terreiroSensivel,
      visibilidadeLocalizacao: LocalizacaoVisibilidade.PRIVADA,
    });

    expect(resultado.cidade).toBe('São Paulo');
    expect(resultado.estado).toBe('SP');
  });

  it('PRIVADA: campo localizacaoPrivada=true é adicionado para indicar ao frontend', () => {
    const resultado = mascararLocalizacao({
      ...terreiroSensivel,
      visibilidadeLocalizacao: LocalizacaoVisibilidade.PRIVADA,
    });

    expect(resultado.localizacaoPrivada).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────
  // APROXIMADA: coordenadas são mascaradas com ~1km de imprecisão
  // ──────────────────────────────────────────────────────────────

  it('APROXIMADA: coordenadas arredondadas a 3 casas decimais (~111m por grau)', () => {
    const resultado = mascararLocalizacao({
      ...terreiroSensivel,
      visibilidadeLocalizacao: LocalizacaoVisibilidade.APROXIMADA,
    });

    // Validação de arredondamento (3 casas = ~111m de erro por grau)
    expect(resultado.latitude).toBe(-23.549);
    expect(resultado.longitude).toBe(-46.639);
    expect(resultado.localizacaoAproximada).toBe(true);
  });

  it('APROXIMADA: latitude e longitude são mascarados (geoPoint é campo de PostGIS interno)', () => {
    const resultado = mascararLocalizacao({
      ...terreiroSensivel,
      visibilidadeLocalizacao: LocalizacaoVisibilidade.APROXIMADA,
    });

    // lat/long devem estar arredondados — NÃO iguais ao original
    expect(resultado.latitude).not.toBe(terreiroSensivel.latitude);
    expect(resultado.longitude).not.toBe(terreiroSensivel.longitude);
    // Indicador de aproximação presente
    expect(resultado.localizacaoAproximada).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────
  // Resistência a null/undefined
  // ──────────────────────────────────────────────────────────────

  it('null retorna null sem quebrar', () => {
    expect(mascararLocalizacao(null)).toBeNull();
  });

  it('undefined retorna undefined sem quebrar', () => {
    expect(mascararLocalizacao(undefined)).toBeUndefined();
  });

  it('sem campo visibilidadeLocalizacao, padrão é PUBLICO', () => {
    const resultado = mascararLocalizacao({ ...terreiroSensivel });
    expect(resultado.latitude).toBe(-23.5489);
    expect(resultado.longitude).toBe(-46.6388);
    expect(resultado.localizacaoPrivada).toBeUndefined();
    expect(resultado.localizacaoAproximada).toBeUndefined();
  });
});
