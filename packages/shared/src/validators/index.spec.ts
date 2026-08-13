import { describe, expect, it } from 'vitest';
import {
  BuscaSchema,
  CriarAvaliacaoSchema,
  CriarEventoSchema,
  CriarTerreiroSchema,
  CriarUsuarioSchema,
  LoginSchema,
} from './index';

describe('CriarUsuarioSchema', () => {
  it('aceita usuário válido', () => {
    const result = CriarUsuarioSchema.safeParse({
      email: 'irma@axemap.com.br',
      nome: 'Irmã de Santo',
      senha: 'senhaSegura123',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = CriarUsuarioSchema.safeParse({
      email: 'invalido',
      nome: 'Nome',
      senha: 'senhaSegura123',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita senha menor que 8 caracteres', () => {
    const result = CriarUsuarioSchema.safeParse({
      email: 'irma@axemap.com.br',
      nome: 'Nome',
      senha: 'curta',
    });
    expect(result.success).toBe(false);
  });
});

describe('CriarTerreiroSchema', () => {
  it('aceita terreiro válido com coordenadas dentro do Brasil', () => {
    const result = CriarTerreiroSchema.safeParse({
      nome: 'Ilê Axé Omim',
      tradicao: 'Candomblé Ketu',
      cidade: 'Salvador',
      estado: 'BA',
      latitude: -12.9777,
      longitude: -38.5016,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita latitude fora do intervalo', () => {
    const result = CriarTerreiroSchema.safeParse({
      nome: 'Ilê',
      tradicao: 'Candomblé',
      cidade: 'Salvador',
      estado: 'BA',
      latitude: 95,
      longitude: -38.5016,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita estado com tamanho diferente de 2', () => {
    const result = CriarTerreiroSchema.safeParse({
      nome: 'Ilê Axé',
      tradicao: 'Candomblé',
      cidade: 'Salvador',
      estado: 'Bahia',
      latitude: -12.9777,
      longitude: -38.5016,
    });
    expect(result.success).toBe(false);
  });
});

describe('CriarAvaliacaoSchema', () => {
  it('aceita nota no intervalo 1-5', () => {
    const result = CriarAvaliacaoSchema.safeParse({
      nota: 5,
      texto: 'Ótima casa',
      terreiroId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita nota 0', () => {
    const result = CriarAvaliacaoSchema.safeParse({
      nota: 0,
      terreiroId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita terreiroId que não é UUID', () => {
    const result = CriarAvaliacaoSchema.safeParse({
      nota: 4,
      terreiroId: 'nao-eh-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('CriarEventoSchema', () => {
  it('aceita evento válido', () => {
    const result = CriarEventoSchema.safeParse({
      titulo: 'Festa de Iemanjá',
      tipo: 'Festa',
      dataInicio: '2026-02-02T12:00:00Z',
      isPublico: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita dataInicio que não é datetime', () => {
    const result = CriarEventoSchema.safeParse({
      titulo: 'Festa',
      tipo: 'Festa',
      dataInicio: '02/02/2026',
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('aceita credenciais válidas', () => {
    const result = LoginSchema.safeParse({
      email: 'irma@axemap.com.br',
      senha: 'qualquer',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita senha vazia', () => {
    const result = LoginSchema.safeParse({
      email: 'irma@axemap.com.br',
      senha: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('BuscaSchema', () => {
  it('aplica defaults de paginação', () => {
    const result = BuscaSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it('rejeita limit maior que 100', () => {
    const result = BuscaSchema.safeParse({ limit: 500 });
    expect(result.success).toBe(false);
  });
});
