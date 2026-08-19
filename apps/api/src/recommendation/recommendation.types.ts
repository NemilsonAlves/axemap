export interface PesoRecomendacao {
  distancia: number;
  trustScore: number;
  avaliacoes: number;
  popularidade: number;
  eventosAtivos: number;
  cursos: number;
  atualizacao: number;
  afinidade: number;
}

export interface FatorRecomendacao {
  nome: string;
  valor: number;
  contribuicao: number;
}

export interface Recomendacao {
  terreiroId: string;
  nome: string;
  slug: string;
  tradicao: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
  localizacaoAproximada?: boolean;
  descricaoCurta: string | null;
  fotoUrl: string | null;
  score: number;
  distanciaKm?: number;
  fatores: FatorRecomendacao[];
  explicacao: string;
  calculadoEm: string;
}

export interface BlocoHome {
  id: string;
  titulo: string;
  subtitulo: string;
  tipo: 'terreiros' | 'eventos' | 'cursos' | 'acoes-sociais';
  itens: Recomendacao[] | EventoSimples[] | CursoSimples[];
  linkVerMais?: string;
}

export interface EventoSimples {
  id: string;
  titulo: string;
  tipo: string;
  dataInicio: string;
  local: string;
  terreiroNome: string;
  terreiroSlug: string;
  cidade: string;
  estado: string;
}

export interface CursoSimples {
  id: string;
  titulo: string;
  modalidade: string | null;
  dataInicio: string | null;
  terreiroNome: string;
  terreiroSlug: string;
  cidade: string;
  estado: string;
}

export interface PreferenciasUsuario {
  tradicoesFavoritas?: string[];
  raioMaxKm?: number;
  interesseEventos?: boolean;
  interesseCursos?: boolean;
  interesseAcoesSociais?: boolean;
}

export interface ContextoRecomendacao {
  usuarioId?: string;
  latitude?: number;
  longitude?: number;
  preferencias?: PreferenciasUsuario;
  historicoTerreiroIds?: string[];
  tradicaoInteresse?: string;
}
