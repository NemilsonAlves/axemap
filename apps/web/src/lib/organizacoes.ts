import { OrganizationVerificationLevel } from '@axemap/shared';

export const TIPOS_ORGANIZACAO: Array<{ value: string; label: string; descricao: string }> = [
  { value: 'FEDERACAO', label: 'Federação', descricao: 'Rede que reúne casas, templos e comunidades sob uma estrutura comum de representação.' },
  { value: 'CONFEDERACAO', label: 'Confederação', descricao: 'Instância que articula federações e associações em nível nacional ou internacional.' },
  { value: 'ASSOCIACAO', label: 'Associação', descricao: 'Entidade civil de representação e defesa de interesses da comunidade.' },
  { value: 'INSTITUTO', label: 'Instituto', descricao: 'Organização dedicada a pesquisa, memória, formação ou preservação cultural.' },
  { value: 'UNIVERSIDADE', label: 'Universidade', descricao: 'Instituição de ensino e pesquisa que estuda tradições, história e culturas de matriz africana.' },
  { value: 'MUSEU', label: 'Museu', descricao: 'Espaço de preservação, documentação e exposição de patrimônio material e imaterial.' },
  { value: 'CENTRO_CULTURAL', label: 'Centro Cultural', descricao: 'Espaço de convivência, ensino e difusão de expressões culturais.' },
  { value: 'PROJETO_SOCIAL', label: 'Projeto Social', descricao: 'Iniciativa com impacto social, comunitário ou educacional.' },
  { value: 'DEFESA_LIBERDADE_RELIGIOSA', label: 'Defesa da Liberdade Religiosa', descricao: 'Organização dedicada à proteção do direito à liberdade religiosa.' },
  { value: 'PARCEIRO', label: 'Parceiro', descricao: 'Organização parceira do AxéMap.' },
  { value: 'COMUNIDADE', label: 'Comunidade', descricao: 'Comunidade de prática, de território ou de tradição.' },
  { value: 'PESQUISADOR', label: 'Pesquisador(a)', descricao: 'Pesquisador ou pesquisadora dedicado(a) às tradições, história e memória de matriz africana.' },
  { value: 'GRUPO_DE_PESQUISA', label: 'Grupo de Pesquisa', descricao: 'Coletivo acadêmico ou comunitário dedicado à pesquisa e documentação.' },
  { value: 'TEMPLO', label: 'Templo', descricao: 'Casa de culto e comunidade religiosa de tradição de matriz africana.' },
  { value: 'ORGANIZACAO_INTERNACIONAL', label: 'Organização Internacional', descricao: 'Organização com atuação em múltiplos países ou âmbito global.' },
];

export const VERIFICACAO_ORGANIZACAO: Record<string, { label: string; tom: 'nao' | 'reivindicada' | 'verificada' | 'parceiro' }> = {
  [OrganizationVerificationLevel.NAO_VERIFICADA]: { label: 'Informação não verificada', tom: 'nao' },
  [OrganizationVerificationLevel.REIVINDICADA]: { label: 'Perfil reivindicado', tom: 'reivindicada' },
  [OrganizationVerificationLevel.VERIFICADA]: { label: 'Perfil verificado', tom: 'verificada' },
  [OrganizationVerificationLevel.ORGANIZACAO_VERIFICADA]: { label: 'Organização verificada', tom: 'verificada' },
  [OrganizationVerificationLevel.PARCEIRO_INSTITUCIONAL]: { label: 'Parceiro institucional', tom: 'parceiro' },
};

export function labelTipoOrganizacao(tipo: string): string {
  return TIPOS_ORGANIZACAO.find((t) => t.value === tipo)?.label ?? tipo.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function descricaoTipoOrganizacao(tipo: string): string {
  const item = TIPOS_ORGANIZACAO.find((t) => t.value === tipo);
  return item?.descricao ?? 'Organização da Rede AxéMap.';
}

export function nomePaisPublico(pais?: string | null): string {
  const nomes: Record<string, string> = {
    BR: 'Brasil',
    AN: 'Angola',
    AR: 'Argentina',
    BJ: 'Benim',
    CD: 'República Democrática do Congo',
    CG: 'Congo',
    CU: 'Cuba',
    DO: 'República Dominicana',
    FR: 'França',
    HT: 'Haiti',
    MX: 'México',
    NG: 'Nigéria',
    PT: 'Portugal',
    TG: 'Togo',
    US: 'Estados Unidos',
    UY: 'Uruguai',
    VE: 'Venezuela',
  };
  return (pais && nomes[pais]) || pais || '';
}