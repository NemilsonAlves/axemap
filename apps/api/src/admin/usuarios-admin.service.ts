import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@axemap/shared';

const ROLES_ADMINISTRATIVAS = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;

const USUARIO_PUBLICO = {
  id: true,
  email: true,
  nome: true,
  role: true,
  avatarUrl: true,
  isVerified: true,
  trustScore: true,
  bloqueadoEm: true,
  motivoBloqueio: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsuariosAdminService {
  constructor(private prisma: PrismaService) {}

  async listarUsuarios(q?: string, role?: string, status?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { nome: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'TODOS') where.role = role;
    if (status === 'BLOQUEADO') where.bloqueadoEm = { not: null };
    if (status === 'ATIVO') where.bloqueadoEm = null;

    const [data, total] = await Promise.all([
      this.prisma.usuarios.findMany({
        where,
        select: USUARIO_PUBLICO,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.usuarios.count({ where }),
    ]);

    return { data, total };
  }

  async detalharUsuario(id: string) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id },
      select: {
        ...USUARIO_PUBLICO,
        _count: {
          select: {
            terreirosCriados: true,
            avaliacoes: true,
            denunciasFeitas: true,
            conteudosCriados: true,
            campanhasCriadas: true,
            eventosCriados: true,
            notificacoes: true,
            mediacoesIniciadas: true,
            certificadosConcedidos: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!usuario || usuario.deletedAt) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async bloquearUsuario(id: string, adminId: string, motivo?: string) {
    if (id === adminId) throw new ForbiddenException('Você não pode bloquear a si mesmo');

    const alvo = await this.verificarExistente(id);
    if (alvo.bloqueadoEm) throw new BadRequestException('Usuário já está bloqueado');

    if (!motivo || !motivo.trim()) throw new BadRequestException('Informe o motivo do bloqueio');

    return this.prisma.usuarios.update({
      where: { id },
      data: { bloqueadoEm: new Date(), motivoBloqueio: motivo.trim(), refreshToken: null },
      select: USUARIO_PUBLICO,
    });
  }

  async desbloquearUsuario(id: string) {
    const alvo = await this.verificarExistente(id);
    if (!alvo.bloqueadoEm) throw new BadRequestException('Usuário não está bloqueado');

    return this.prisma.usuarios.update({
      where: { id },
      data: { bloqueadoEm: null, motivoBloqueio: null },
      select: USUARIO_PUBLICO,
    });
  }

  async alterarRole(id: string, role: string, adminId: string, adminRole: string) {
    if (id === adminId) throw new ForbiddenException('Você não pode alterar seu próprio papel');

    const roleValida = Object.values(UserRole).includes(role as UserRole);
    if (!roleValida) throw new BadRequestException('Papel inválido');

    const alvo = await this.verificarExistente(id);

    const roleAdministrativa = (ROLES_ADMINISTRATIVAS as readonly string[]).includes(role);
    const alvoEhAdmin = (ROLES_ADMINISTRATIVAS as readonly string[]).includes(alvo.role);
    if (roleAdministrativa || alvoEhAdmin) {
      if (adminRole !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Apenas SUPER_ADMIN pode alterar papéis administrativos');
      }
    }

    return this.prisma.usuarios.update({
      where: { id },
      data: { role: role as UserRole },
      select: USUARIO_PUBLICO,
    });
  }

  private async verificarExistente(id: string) {
    const usuario = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!usuario || usuario.deletedAt) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }
}
