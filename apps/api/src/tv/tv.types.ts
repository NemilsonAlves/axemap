/**
 * TV AxéMap — tipos e DTOs.
 *
 * Conteúdo cultural enviado pelas comunidades.
 * Fluxo: casa submete → moderação → aprovação → publicado.
 */

export enum EpisodioStatus {
  RASCUNHO = 'RASCUNHO',
  AGUARDANDO_REVISAO = 'AGUARDANDO_REVISAO',
  EM_REVISAO = 'EM_REVISAO',
  APROVADO = 'APROVADO',
  PUBLICADO = 'PUBLICADO',
  PAUSADO = 'PAUSADO',
  REJEITADO = 'REJEITADO',
  ARQUIVADO = 'ARQUIVADO',
}

export interface SubmeterEpisodioDto {
  titulo: string;
  descricao?: string;
  tipo?: string;
  youtubeId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duracao?: number;
  tags?: string[];
  tradicao?: string;
  terreiroId?: string;
}

export interface AprovarEpisodioDto {
  motivoRejeicao?: string;
}
