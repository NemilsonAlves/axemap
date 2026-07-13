import { z } from 'zod';

export const CriarTerreiroSchema = z.object({
  nome: z.string().min(3).max(255),
  tradicao: z.string().min(3).max(100),
  descricaoCurta: z.string().max(500).optional(),
  cidade: z.string().min(2).max(100),
  estado: z.string().length(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
});

export const AtualizarTerreiroSchema = CriarTerreiroSchema.partial();

export const CriarAvaliacaoSchema = z.object({
  nota: z.number().min(1).max(5),
  texto: z.string().max(2000).optional(),
  terreiroId: z.string().uuid(),
});

export const CriarEventoSchema = z.object({
  titulo: z.string().min(3).max(255),
  descricao: z.string().max(5000).optional(),
  tipo: z.string().min(3),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime().optional(),
  capacidade: z.number().positive().optional(),
  isPublico: z.boolean().default(true),
});

export const CriarUsuarioSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(2).max(255),
  senha: z.string().min(8).max(128),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const BuscaSchema = z.object({
  q: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  tradicao: z.string().optional(),
  minTrustScore: z.number().min(0).max(100).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  raioKm: z.number().positive().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type CriarTerreiroDto = z.infer<typeof CriarTerreiroSchema>;
export type AtualizarTerreiroDto = z.infer<typeof AtualizarTerreiroSchema>;
export type CriarAvaliacaoDto = z.infer<typeof CriarAvaliacaoSchema>;
export type CriarEventoDto = z.infer<typeof CriarEventoSchema>;
export type CriarUsuarioDto = z.infer<typeof CriarUsuarioSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type BuscaDto = z.infer<typeof BuscaSchema>;
