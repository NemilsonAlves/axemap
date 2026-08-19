import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../common/mail/mail.service';
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
  let mail: { sendPasswordReset: jest.Mock };

  beforeEach(async () => {
    prisma = {
      usuarios: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    };
    jwt = { sign: jest.fn(() => 'token'), verify: jest.fn(() => ({ sub: 'u1', email: 'x@x.com' })) };
    mail = { sendPasswordReset: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: MailService, useValue: mail },
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

  describe('forgotPassword', () => {
    it('envia e-mail de redefinição quando o usuário existe', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'teste@axemap.com',
        nome: 'Teste',
        bloqueadoEm: null,
      });
      prisma.usuarios.update.mockResolvedValue({});

      const result = await service.forgotPassword('teste@axemap.com');

      expect(result.message).toContain('Se o e-mail existir');
      expect(mail.sendPasswordReset).toHaveBeenCalledTimes(1);
      const [to, , url] = mail.sendPasswordReset.mock.calls[0];
      expect(to).toBe('teste@axemap.com');
      expect(url).toContain('/auth/recuperar-senha?token=');
    });

    it('não revela se o e-mail não existe e não envia e-mail', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nao-existe@axemap.com');

      expect(result.message).toContain('Se o e-mail existir');
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('não envia e-mail para usuário bloqueado', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'bloqueado@axemap.com',
        nome: 'Teste',
        bloqueadoEm: new Date(),
      });

      const result = await service.forgotPassword('bloqueado@axemap.com');

      expect(result.message).toContain('Se o e-mail existir');
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });
  });
});
