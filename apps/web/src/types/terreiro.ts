export interface TerreiroFoto {
  id: string;
  url: string;
  thumbUrl: string | null;
  alt: string | null;
  ordem: number;
  categoria: string | null;
  isPrincipal: boolean;
}

export interface TerreiroVideo {
  id: string;
  url: string;
  titulo: string | null;
  descricao: string | null;
  ordem: number;
}

export interface AvaliacaoResposta {
  id: string;
  texto: string;
  createdAt: string;
}

export interface Avaliacao {
  id: string;
  nota: number;
  texto: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; avatarUrl: string | null };
  resposta: AvaliacaoResposta | null;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  dataInicio: string;
  dataFim: string | null;
  isPublico: boolean;
}

export interface Curso {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: string | null;
  cargaHoraria: number | null;
  vagas: number | null;
  dataInicio: string | null;
  dataFim: string | null;
}

export interface AcaoSocial {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  data: string | null;
  alcance: number | null;
}

export interface ProfileStats {
  totalAvaliacoes: number;
  mediaNota: number;
  totalFavoritos: number;
  totalEventos: number;
  totalFotos: number;
}

export interface CompletenessItem {
  key: string;
  label: string;
  peso: number;
  ok: boolean;
  done: boolean;
}

export interface ProfileCompleteness {
  score: number;
  total: number;
  items: CompletenessItem[];
}

export interface TrustScoreInfo {
  score: number;
  nivel: string;
  label: string;
}

export interface TerreiroPerfil {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  status: string;
  trustScore: number;
  descricaoCurta: string | null;
  descricaoLonga: string | null;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  telefone: string | null;
  email: string | null;
  website: string | null;
  horarioFuncionamento: string | null;
  isPublished: boolean;
  isVerified: boolean;
  verificationLevel: string;
  fotoUrl: string | null;
  anoFundacao: number | null;
  linhagem: string | null;
  instagram: string | null;
  whatsapp: string | null;
  facebook: string | null;
  acessibilidade: boolean;
  estacionamento: string | null;
  publicadoEm: string | null;
  createdAt: string;
  updatedAt: string;

  dirigente: { id: string; nome: string; avatarUrl: string | null } | null;
  avaliacoes: Avaliacao[];
  eventos: Evento[];
  cursos: Curso[];
  acoesSociais: AcaoSocial[];
  fotos: TerreiroFoto[];
  videos: TerreiroVideo[];

  stats: ProfileStats;
  completeness: ProfileCompleteness;
  trustScoreInfo: TrustScoreInfo;
  geoJSON: GeoJSON.Point | null;
}
