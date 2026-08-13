import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService (bloqueio de usuários)', () => {
  let service: AuthService;
  let prisma: { usuarios: { findUnique: jest.Mock; update: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      usuarios: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    };
    jwt = { sign: jest.fn(() => 'token'), verify: jest.fn(() => ({ sub: 'u1', email: 'x@x.com' })) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('rejeita credenciais inválidas', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', senha: 'senha123' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejeita senha incorreta', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ id: 'u1', senhaHash: 'hash', bloqueadoEm: null });
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(service.login({ email: 'x@x.com', senha: 'errada' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejeita login de usuário bloqueado mesmo com senha correta', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'bloqueado@axemap.com',
        senhaHash: 'hash',
        bloqueadoEm: new Date(),
      });
      bcryptMock.compare.mockResolvedValue(true as never);

      await expect(
        service.login({ email: 'bloqueado@axemap.com', senha: 'qualquer123' }),
      ).rejects.toThrow('Usuário bloqueado');
      expect(prisma.usuarios.update).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rejeita refresh de usuário bloqueado', async () => {
      jwt.verify.mockReturnValue({ sub: 'u1', email: 'x@x.com' });
      prisma.usuarios.findUnique.mockResolvedValue({
        id: 'u1',
        refreshToken: 'rt',
        bloqueadoEm: new Date(),
      });

      await expect(service.refresh('rt')).rejects.toThrow('Usuário bloqueado');
    });
  });
});
