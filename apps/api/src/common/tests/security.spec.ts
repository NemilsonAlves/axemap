/**
 * TESTE CRÍTICO: Segurança — Validação de campos, permissões e restrições
 *
 * Garante:
 * - Terreiro: apenas campos whitelisted são atualizados (trustScore, isPublished bloqueados)
 * - Terreiro: exclusão apenas por dirigente dono ou ADMIN
 * - Auth: validação de perfil (nome obrigatório, max 200 chars)
 * - Notificações: criação restrita a ADMIN
 *
 * Referência: Prompt 14, seções de segurança e permissões.
 */

import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TerreiroService } from '../../terreiro/terreiro.service';
import { AuthService } from '../../auth/auth.service';
import { NotificacoesController } from '../../notificacoes/notificacoes.controller';
import { PrismaService } from '../../database/prisma.service';
import { NotificacoesService } from '../../notificacoes/notificacoes.service';

// ─── Helpers ──────────────────────────────────────────────────────

function createPrismaMock() {
  return {
    terreiros: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    usuarios: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };
}

// ══════════════════════════════════════════════════════════════════
// 1. Terreiro — Field Whitelisting (atualizar)
// ══════════════════════════════════════════════════════════════════

describe('Terreiro — Field Whitelisting (atualizar)', () => {
  let terreiroService: TerreiroService;
  let prisma: ReturnType<typeof createPrismaMock>;

  const terreiroBase = {
    id: 't1',
    nome: 'Terreiro Original',
    slug: 'terreiro-original',
    dirigenteId: 'user-dirigente',
    trustScore: 50,
    isPublished: true,
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    prisma.terreiros.findUnique.mockResolvedValue({ ...terreiroBase });
    prisma.terreiros.update.mockResolvedValue({ ...terreiroBase });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TerreiroService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    terreiroService = moduleRef.get(TerreiroService);
  });

  afterEach(() => jest.clearAllMocks());

  it('atualizar() aceita campo "nome" e o persiste', async () => {
    prisma.terreiros.update.mockResolvedValue({ ...terreiroBase, nome: 'Novo Nome' });

    await terreiroService.atualizar('t1', { nome: 'Novo Nome' }, { id: 'user-dirigente' });

    expect(prisma.terreiros.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ nome: 'Novo Nome' }),
      }),
    );
  });

  it('atualizar() REJEITA trustScore — campo não está no whitelist e lança BadRequestException', async () => {
    await expect(
      terreiroService.atualizar('t1', { trustScore: 999 }, { id: 'user-dirigente' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('atualizar() REJEITA isPublished — campo não está no whitelist e lança BadRequestException', async () => {
    await expect(
      terreiroService.atualizar('t1', { isPublished: false }, { id: 'user-dirigente' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('atualizar() combina campo permitido com campo não-permitido, persiste só o permitido', async () => {
    prisma.terreiros.update.mockResolvedValue({ ...terreiroBase, nome: 'X' });

    await terreiroService.atualizar(
      't1',
      { nome: 'X', trustScore: 999, isPublished: false },
      { id: 'user-dirigente' },
    );

    const updateCall = prisma.terreiros.update.mock.calls[0]?.[0];
    expect(updateCall?.data).toEqual({ nome: 'X' });
    expect(updateCall?.data?.trustScore).toBeUndefined();
    expect(updateCall?.data?.isPublished).toBeUndefined();
  });

  it('atualizar() lança BadRequestException quando nenhum campo válido é enviado', async () => {
    await expect(
      terreiroService.atualizar('t1', { trustScore: 999, isPublished: false }, { id: 'user-dirigente' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('atualizar() lança NotFoundException quando terreiro não existe', async () => {
    prisma.terreiros.findUnique.mockResolvedValue(null);

    await expect(
      terreiroService.atualizar('t-inexistente', { nome: 'X' }, { id: 'user-dirigente' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('atualizar() lança ForbiddenException quando usuário não é dirigente nem ADMIN', async () => {
    await expect(
      terreiroService.atualizar('t1', { nome: 'X' }, { id: 'user-outro', role: 'DIRIGENTE' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('atualizar() permite ADMIN editar qualquer terreiro', async () => {
    prisma.terreiros.update.mockResolvedValue({ ...terreiroBase, nome: 'Editado pelo Admin' });

    await terreiroService.atualizar('t1', { nome: 'Editado pelo Admin' }, { id: 'admin-user', role: 'ADMIN' });

    expect(prisma.terreiros.update).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════
// 2. Terreiro — Delete Membership Check (deletar)
// ══════════════════════════════════════════════════════════════════

describe('Terreiro — Delete Membership Check (deletar)', () => {
  let terreiroService: TerreiroService;
  let prisma: ReturnType<typeof createPrismaMock>;

  const terreiroBase = {
    id: 't1',
    nome: 'Terreiro Teste',
    dirigenteId: 'user-dirigente',
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = createPrismaMock();
    prisma.terreiros.findUnique.mockResolvedValue({ ...terreiroBase });
    prisma.terreiros.update.mockResolvedValue({ ...terreiroBase, deletedAt: new Date() });
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'user-dirigente', role: 'DIRIGENTE' });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TerreiroService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    terreiroService = moduleRef.get(TerreiroService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deletar() sucesso quando usuário é o dirigente dono', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'user-dirigente', role: 'DIRIGENTE' });

    await terreiroService.deletar('t1', 'user-dirigente');

    expect(prisma.terreiros.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('deletar() sucesso quando usuário é ADMIN', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'admin-user', role: 'ADMIN' });

    await terreiroService.deletar('t1', 'admin-user');

    expect(prisma.terreiros.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('deletar() sucesso quando usuário é SUPER_ADMIN', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'superadmin-user', role: 'SUPER_ADMIN' });

    await terreiroService.deletar('t1', 'superadmin-user');

    expect(prisma.terreiros.update).toHaveBeenCalled();
  });

  it('deletar() falha quando usuário é DIRIGENTE diferente do dono', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'user-outro', role: 'DIRIGENTE' });

    await expect(
      terreiroService.deletar('t1', 'user-outro'),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('deletar() falha quando terreiro não existe', async () => {
    prisma.terreiros.findUnique.mockResolvedValue(null);

    await expect(
      terreiroService.deletar('t-inexistente', 'user-dirigente'),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.terreiros.update).not.toHaveBeenCalled();
  });

  it('deletar() falha quando usuário é VISITOR', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'visitor-user', role: 'VISITOR' });

    await expect(
      terreiroService.deletar('t1', 'visitor-user'),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ══════════════════════════════════════════════════════════════════
// 3. Profile Update Validation (auth.service.updateProfile)
// ══════════════════════════════════════════════════════════════════

describe('AuthService — Profile Update Validation (updateProfile)', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwt: any;
  let mail: any;

  beforeEach(async () => {
    prisma = createPrismaMock();
    prisma.usuarios.update.mockResolvedValue({
      id: 'u1',
      email: 'teste@axemap.com',
      nome: 'Teste',
      role: 'VISITOR',
      avatarUrl: null,
    });

    jwt = { sign: jest.fn(() => 'token'), verify: jest.fn() };
    mail = { sendPasswordReset: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: require('@nestjs/jwt').JwtService, useValue: jwt },
        { provide: require('../../common/mail/mail.service').MailService, useValue: mail },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('updateProfile() sucesso com nome válido', async () => {
    prisma.usuarios.update.mockResolvedValue({
      id: 'u1',
      email: 'teste@axemap.com',
      nome: 'Novo Nome',
      role: 'VISITOR',
      avatarUrl: null,
    });

    const result = await authService.updateProfile('u1', { nome: 'Novo Nome' });

    expect(result.nome).toBe('Novo Nome');
    expect(prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: { nome: 'Novo Nome' },
      }),
    );
  });

  it('updateProfile() falha com nome vazio ("")', async () => {
    await expect(
      authService.updateProfile('u1', { nome: '' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('updateProfile() falha com nome de apenas espaços (trimmed vazio)', async () => {
    await expect(
      authService.updateProfile('u1', { nome: '   ' }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('updateProfile() falha com nome com mais de 200 caracteres', async () => {
    const nomeLongo = 'A'.repeat(201);

    await expect(
      authService.updateProfile('u1', { nome: nomeLongo }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('updateProfile() sucesso com nome de exatamente 200 caracteres', async () => {
    const nomeMax = 'A'.repeat(200);
    prisma.usuarios.update.mockResolvedValue({
      id: 'u1',
      email: 'teste@axemap.com',
      nome: nomeMax,
      role: 'VISITOR',
      avatarUrl: null,
    });

    const result = await authService.updateProfile('u1', { nome: nomeMax });

    expect(result.nome).toBe(nomeMax);
    expect(prisma.usuarios.update).toHaveBeenCalled();
  });

  it('updateProfile() sucesso alterando apenas avatarUrl', async () => {
    prisma.usuarios.update.mockResolvedValue({
      id: 'u1',
      email: 'teste@axemap.com',
      nome: 'Teste',
      role: 'VISITOR',
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const result = await authService.updateProfile('u1', {
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: { avatarUrl: 'https://example.com/avatar.jpg' },
      }),
    );
  });

  it('updateProfile() faz trim no nome antes de validar', async () => {
    prisma.usuarios.update.mockResolvedValue({
      id: 'u1',
      email: 'teste@axemap.com',
      nome: 'Nome Com Espaços',
      role: 'VISITOR',
      avatarUrl: null,
    });

    await authService.updateProfile('u1', { nome: '  Nome Com Espaços  ' });

    expect(prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { nome: 'Nome Com Espaços' },
      }),
    );
  });
});

// ══════════════════════════════════════════════════════════════════
// 4. Notifications — Admin Restriction (notificacoes.controller.criar)
// ══════════════════════════════════════════════════════════════════

describe('Notificações — Admin Restriction (criar)', () => {
  let controller: NotificacoesController;
  let prisma: ReturnType<typeof createPrismaMock>;
  let notificacoesService: any;

  beforeEach(async () => {
    prisma = createPrismaMock();
    notificacoesService = {
      criar: jest.fn().mockResolvedValue({ id: 'n1', tipo: 'SISTEMA', titulo: 'Teste' }),
      listar: jest.fn().mockResolvedValue([]),
      contarNaoLidas: jest.fn().mockResolvedValue(0),
      marcarLida: jest.fn(),
      marcarTodasLidas: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificacoesController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: NotificacoesService, useValue: notificacoesService },
      ],
    }).compile();

    controller = moduleRef.get(NotificacoesController);
  });

  afterEach(() => jest.clearAllMocks());

  const dto = { tipo: 'SISTEMA', titulo: 'Notificação de teste', mensagem: 'Corpo da mensagem' };

  it('criar() sucesso quando usuário é ADMIN', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'admin1', role: 'ADMIN' });

    const result = await controller.criar({ id: 'admin1' }, dto);

    expect(result).toEqual({ id: 'n1', tipo: 'SISTEMA', titulo: 'Teste' });
    expect(notificacoesService.criar).toHaveBeenCalledWith('admin1', dto);
  });

  it('criar() sucesso quando usuário é SUPER_ADMIN', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'superadmin1', role: 'SUPER_ADMIN' });

    const result = await controller.criar({ id: 'superadmin1' }, dto);

    expect(result).toEqual({ id: 'n1', tipo: 'SISTEMA', titulo: 'Teste' });
    expect(notificacoesService.criar).toHaveBeenCalledWith('superadmin1', dto);
  });

  it('criar() falha quando usuário é VISITOR', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'visitor1', role: 'VISITOR' });

    await expect(
      controller.criar({ id: 'visitor1' }, dto),
    ).rejects.toThrow(ForbiddenException);

    expect(notificacoesService.criar).not.toHaveBeenCalled();
  });

  it('criar() falha quando usuário é DIRIGENTE', async () => {
    prisma.usuarios.findUnique.mockResolvedValue({ id: 'dirigente1', role: 'DIRIGENTE' });

    await expect(
      controller.criar({ id: 'dirigente1' }, dto),
    ).rejects.toThrow(ForbiddenException);

    expect(notificacoesService.criar).not.toHaveBeenCalled();
  });

  it('criar() falha quando usuário não é encontrado no banco', async () => {
    prisma.usuarios.findUnique.mockResolvedValue(null);

    await expect(
      controller.criar({ id: 'user-fantasma' }, dto),
    ).rejects.toThrow(ForbiddenException);

    expect(notificacoesService.criar).not.toHaveBeenCalled();
  });
});
