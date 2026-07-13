import { TerreiroStatus, Tradicao, TrustScoreLevel } from '../enums';

export interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Terreiro {
  id: string;
  nome: string;
  slug: string;
  tradicao: Tradicao;
  status: TerreiroStatus;
  trustScore: number;
  trustScoreLevel: TrustScoreLevel;
  descricaoCurta?: string;
  descricaoLonga?: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  telefone?: string;
  email?: string;
  website?: string;
  horarioFuncionamento?: string;
  isPublished: boolean;
  isVerified: boolean;
  fotoUrl?: string;
  galeriaUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  dataInicio: Date;
  dataFim?: Date;
  terreiroId: string;
  capacidade?: number;
  isPublico: boolean;
  createdAt: Date;
}

export interface Avaliacao {
  id: string;
  nota: number;
  texto?: string;
  usuarioId: string;
  terreiroId: string;
  pesoAvaliador: number;
  utilCount: number;
  createdAt: Date;
}

export interface Endereco {
  logradouro: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number;
  longitude: number;
}

export interface TrustScoreComponents {
  completude: number;
  verificacao: number;
  frescor: number;
  reputacao: number;
  historico: number;
  social: number;
}
