import { mascararLocalizacao } from './location-visibility';
import { LocalizacaoVisibilidade } from '@axemap/shared';

describe('mascararLocalizacao', () => {
  const terreiroBase = {
    id: 't1',
    nome: 'Terreiro Exemplo',
    latitude: -22.9112,
    longitude: -43.2052,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
  };

  it('mantém coordenadas exatas quando PUBLICO', () => {
    const r = mascararLocalizacao({ ...terreiroBase, visibilidadeLocalizacao: LocalizacaoVisibilidade.PUBLICO });
    expect(r.latitude).toBe(-22.9112);
    expect(r.longitude).toBe(-43.2052);
    expect(r.localizacaoAproximada).toBeUndefined();
  });

  it('arredonda coordenadas quando APROXIMADA', () => {
    const r = mascararLocalizacao({ ...terreiroBase, visibilidadeLocalizacao: LocalizacaoVisibilidade.APROXIMADA });
    expect(r.latitude).toBe(-22.911);
    expect(r.longitude).toBe(-43.205);
    expect(r.localizacaoAproximada).toBe(true);
  });

  it('remove coordenadas quando PRIVADA', () => {
    const r = mascararLocalizacao({ ...terreiroBase, visibilidadeLocalizacao: LocalizacaoVisibilidade.PRIVADA });
    expect(r.latitude).toBeUndefined();
    expect(r.longitude).toBeUndefined();
    expect(r.geoPoint).toBeUndefined();
    expect(r.localizacaoPrivada).toBe(true);
    expect(r.cidade).toBe('Rio de Janeiro');
  });

  it('default é PUBLICO quando ausente', () => {
    const r = mascararLocalizacao({ ...terreiroBase });
    expect(r.latitude).toBe(-22.9112);
    expect(r.longitude).toBe(-43.2052);
  });

  it('não quebra com lat/long nulos', () => {
    const r = mascararLocalizacao({ ...terreiroBase, latitude: null, longitude: null, visibilidadeLocalizacao: LocalizacaoVisibilidade.APROXIMADA });
    expect(r.latitude).toBeNull();
    expect(r.longitude).toBeNull();
  });
});
