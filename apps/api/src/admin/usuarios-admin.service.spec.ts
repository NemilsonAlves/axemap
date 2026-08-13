import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsuariosAdminService } from './usuarios-admin.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@axemap/shared';

describe('UsuariosAdminService', () => {
  let service: UsuariosAdminService;
  let prisma: {
    usuarios: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };

  const usuarioComum = {
    id: 'u1',
    email: 'comum@axemap.com',
    nome: 'Usuário Comum',
    role: UserRole.VISITOR,
    bloqueadoEm: null,
    motivoBloqueio: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      usuarios: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [UsuariosAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsuariosAdminService);
  });

  describe('listarUsuarios', () => {
    it('retorna lista paginada com filtro por status BLOQUEADO', async () => {
      prisma.usuarios.findMany.mockResolvedValue([usuarioComum]);
      prisma.usuarios.count.mockResolvedValue(1);

      const result = await service.listarUsuarios(undefined, undefined, 'BLOQUEADO', 20, 0);

      expect(result.total).toBe(1);
      expect(prisma.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ bloqueadoEm: { not: null } }),
          take: 20,
          skip: 0,
        }),
      );
      expect(prisma.usuarios.count).toHaveBeenCalled();
    });

    it('busca por q em email e nome (case insensitive)', async () => {
      prisma.usuarios.findMany.mockResolvedValue([]);
      prisma.usuarios.count.mockResolvedValue(0);

      await service.listarUsuarios('axemap');

      expect(prisma.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { email: { contains: 'axemap', mode: 'insensitive' } },
              { nome: { contains: 'axemap', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });
  });

  describe('detalharUsuario', () => {
    it('lança NotFoundException quando usuário não existe', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      await expect(service.detalharUsuario('nao-existe')).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException para usuário deletado', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ ...usuarioComum, deletedAt: new Date() });

      await expect(service.detalharUsuario('u1')).rejects.toThrow(NotFoundException);
    });

    it('retorna detalhes sem senhaHash nem refreshToken', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ ...usuarioComum, _count: {} });

      const result = await service.detalharUsuario('u1');

      expect(result).not.toHaveProperty('senhaHash');
      expect(result).not.toHaveProperty('refreshToken');
      expect(prisma.usuarios.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
    });
  });

  describe('bloquearUsuario', () => {
    it('impede bloquear a si mesmo', async () => {
      await expect(service.bloquearUsuario('admin1', 'admin1', 'motivo')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('exige motivo', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);

      await expect(service.bloquearUsuario('u1', 'admin1', '  ')).rejects.toThrow(BadRequestException);
    });

    it('rejeita usuário já bloqueado', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({
        ...usuarioComum,
        bloqueadoEm: new Date(),
      });

      await expect(service.bloquearUsuario('u1', 'admin1', 'motivo')).rejects.toThrow(BadRequestException);
    });

    it('bloqueia, limpa refreshToken e grava motivo', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);
      prisma.usuarios.update.mockResolvedValue({
        ...usuarioComum,
        bloqueadoEm: new Date(),
        motivoBloqueio: 'Uso indevido',
      });

      const result = await service.bloquearUsuario('u1', 'admin1', 'Uso indevido');

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            motivoBloqueio: 'Uso indevido',
            refreshToken: null,
          }),
        }),
      );
      expect(result.motivoBloqueio).toBe('Uso indevido');
    });
  });

  describe('desbloquearUsuario', () => {
    it('rejeita usuário não bloqueado', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);

      await expect(service.desbloquearUsuario('u1')).rejects.toThrow(BadRequestException);
    });

    it('desbloqueia limpando motivo', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ ...usuarioComum, bloqueadoEm: new Date() });
      prisma.usuarios.update.mockResolvedValue({ ...usuarioComum, bloqueadoEm: null });

      await service.desbloquearUsuario('u1');

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bloqueadoEm: null, motivoBloqueio: null }),
        }),
      );
    });
  });

  describe('alterarRole', () => {
    it('impede alterar o próprio papel', async () => {
      await expect(service.alterarRole('admin1', UserRole.VISITOR, 'admin1', UserRole.ADMIN)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejeita papel inválido', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);

      await expect(service.alterarRole('u1', 'PAPEL_INVALIDO', 'admin1', UserRole.SUPER_ADMIN)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('apenas SUPER_ADMIN pode conceder papéis administrativos', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);

      await expect(service.alterarRole('u1', UserRole.ADMIN, 'admin1', UserRole.ADMIN)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('apenas SUPER_ADMIN pode alterar papel de outro admin', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({ ...usuarioComum, role: UserRole.ADMIN });

      await expect(service.alterarRole('u1', UserRole.VISITOR, 'admin1', UserRole.ADMIN)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('SUPER_ADMIN altera papel de usuário comum', async () => {
      prisma.usuarios.findUnique.mockResolvedValue(usuarioComum);
      prisma.usuarios.update.mockResolvedValue({ ...usuarioComum, role: UserRole.MODERATOR });

      const result = await service.alterarRole('u1', UserRole.MODERATOR, 'root', UserRole.SUPER_ADMIN);

      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { role: UserRole.MODERATOR } }),
      );
      expect(result.role).toBe(UserRole.MODERATOR);
    });
  });
});
