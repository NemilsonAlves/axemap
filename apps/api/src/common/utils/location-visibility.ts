import { LocalizacaoVisibilidade } from '@axemap/shared';

/**
 * Mascara coordenadas conforme a visibilidade de localização (Prompt 14, seções 11–12).
 *
 * - PUBLICO: coordenadas exatas são mantidas.
 * - APROXIMADA: latitude/longitude são arredondadas (~1km de precisão) e marcadas
 *   com `localizacaoAproximada: true`.
 * - PRIVADA: latitude/longitude são removidas da resposta pública. A cidade/estado
 *   continuam sendo exibidas quando o nível de privacidade do perfil permitir.
 *
 * Nunca altera o banco — apenas a projeção de resposta.
 */
export function mascararLocalizacao(terreiro: any) {
  if (!terreiro) return terreiro;

  const visibilidade: LocalizacaoVisibilidade =
    terreiro.visibilidadeLocalizacao ?? LocalizacaoVisibilidade.PUBLICO;

  if (visibilidade === LocalizacaoVisibilidade.PUBLICO) {
    return terreiro;
  }

  if (visibilidade === LocalizacaoVisibilidade.APROXIMADA) {
    const aproximar = (v: number | null | undefined) =>
      v == null ? null : Math.round(v * 1000) / 1000;
    return {
      ...terreiro,
      latitude: aproximar(terreiro.latitude),
      longitude: aproximar(terreiro.longitude),
      localizacaoAproximada: true,
    };
  }

  // PRIVADA
  const copia = { ...terreiro };
  delete copia.latitude;
  delete copia.longitude;
  delete copia.geoPoint;
  copia.localizacaoPrivada = true;
  return copia;
}
