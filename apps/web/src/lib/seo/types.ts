export interface TerreiroBasico {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  descricaoCurta?: string | null;
  fotoUrl?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  acessibilidade?: boolean | null;
  estacionamento?: boolean | null;
  publicadoEm: string;
}

export interface EstatisticasCompletas {
  totalTerreiro: number;
  totalVerificados: number;
  trustScoreMedio: number;
  totalAvaliacoes: number;
  mediaAvaliacoes: number;
  totalEventos: number;
  totalCursos: number;
  totalAcoesSociais: number;
  totalDirigentes: number;
  evolucaoCadastros: Array<{ mes: string; count: number }>;
  distribuicaoTradicoes: Array<{ nome: string; label: string; count: number }>;
}

export interface FAQ {
  pergunta: string;
  resposta: string;
}

export interface CriterioSEO {
  nome: string;
  passou: boolean;
  mensagem: string;
}

export interface SEOValidation {
  pontuacao: number;
  noindex: boolean;
  criterios: CriterioSEO[];
}

export interface DiscoveryData {
  cidadesVizinhas?: Array<{ nome: string; count: number; slug: string; distanciaKm?: number }>;
  tradicoesRelacionadas?: Array<{ nome: string; label: string; slug: string }>;
  terreirosProximos?: TerreiroBasico[];
  eventosRelacionados?: EventoLanding[];
  cursosRelacionados?: CursoLanding[];
}

export interface TradicaoInfo {
  nome: string;
  label: string;
  count: number;
  slug?: string;
}

export interface DadosEstado {
  estado: { uf: string; nome: string };
  totalTerreiro: number;
  totalVerificados: number;
  trustScoreMedio: number;
  tradicoes: TradicaoInfo[];
  cidades: Array<{ nome: string; count: number; slug: string }>;
  terreiros: TerreiroBasico[];
  estatisticas: EstatisticasCompletas;
  panorama: string;
  perfilComunidade: string;
  faqs: FAQ[];
  discovery: DiscoveryData;
  seo: SEOValidation;
}

export interface DadosCidade {
  cidade: { nome: string; uf: string; ufNome: string; slug: string };
  totalTerreiro: number;
  totalVerificados: number;
  trustScoreMedio: number;
  tradicoes: TradicaoInfo[];
  terreiros: TerreiroBasico[];
  estatisticas: EstatisticasCompletas;
  panorama: string;
  perfilComunidade: string;
  faqs: FAQ[];
  discovery: DiscoveryData;
  seo: SEOValidation;
}

export interface DadosTradicao {
  tradicao: { nome: string; label: string; slug: string };
  totalTerreiro: number;
  totalVerificados: number;
  trustScoreMedio: number;
  estados: Array<{ uf: string; nome: string; count: number }>;
  cidades: Array<{ nome: string; uf: string; count: number; slug: string }>;
  terreiros: TerreiroBasico[];
  estatisticas: EstatisticasCompletas;
  panorama: string;
  perfilComunidade: string;
  faqs: FAQ[];
  discovery: DiscoveryData;
  seo: SEOValidation;
}

export interface DadosStats {
  totalTerreiro: number;
  totalVerificados: number;
  totalEventos: number;
  totalCursos: number;
  totalAcoesSociais: number;
  totalAvaliacoes: number;
  mediaAvaliacoes: number;
  estados: Array<{ uf: string; nome: string; count: number }>;
  tradicoes: Array<{ nome: string; label: string; count: number }>;
  cidades: Array<{ nome: string; uf: string; count: number; slug: string }>;
}

export interface DadosSitemap {
  terreiros: Array<{ slug: string; updatedAt: string }>;
  estados: string[];
  cidades: Array<{ nome: string; uf: string; slug: string }>;
  tradicoes: string[];
}

export interface EventoLanding {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  dataInicio: string;
  dataFim: string | null;
  isPublico: boolean;
  local: string | null;
  terreiro: {
    id: string;
    nome: string;
    slug: string;
    cidade: string;
    estado: string;
    tradicao?: string;
  };
}

export interface CursoLanding {
  id: string;
  titulo: string;
  descricao: string | null;
  modalidade: string | null;
  cargaHoraria: number | null;
  dataInicio: string | null;
  tradicao: string;
  terreiro: {
    id: string;
    nome: string;
    slug: string;
    cidade: string;
    estado: string;
    tradicao?: string;
  };
}

export interface AcaoSocialLanding {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  data: string | null;
  alcance: number | null;
  terreiro: {
    id: string;
    nome: string;
    slug: string;
    cidade: string;
    estado: string;
  };
}
