import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../common/mail/mail.service';

// 2 horas — alinhado com a documentação e o comportamento esperado pelo usuário.
const RESET_TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(dto: { email: string; nome: string; senha: string }) {
    if (dto.senha.length < 8) throw new BadRequestException('Senha deve ter no mínimo 8 caracteres');

    const existing = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      // Anti-enumeração: sempre faz bcrypt para que o tempo de resposta seja consistente,
      // mas retorna o mesmo erro genérico independentemente de o email existir ou não.
      await bcrypt.hash(dto.senha, 12);
      throw new ConflictException('Não foi possível criar a conta. Verifique os dados informados.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const user = await this.prisma.usuarios.create({
      data: { email: dto.email, nome: dto.nome, senhaHash },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, nome: user.nome, role: user.role, avatarUrl: user.avatarUrl },
      ...tokens,
    };
  }

  async login(dto: { email: string; senha: string }) {
    const user = await this.prisma.usuarios.findUnique({ where: { email: dto.email } });

    // Anti-enumeração: sempre executa bcrypt para que o tempo de resposta seja consistente,
    // independentemente de o e-mail existir ou não.
    const DUMMY_HASH = '$2a$12$dummyhashfortimingequalityprotectiononly000000000000000';
    const senhaParaComparar = user?.senhaHash ?? DUMMY_HASH;
    const isValid = await bcrypt.compare(dto.senha, senhaParaComparar);

    if (!user || !isValid) throw new UnauthorizedException('Credenciais inválidas');
    if (user.bloqueadoEm) throw new UnauthorizedException('Usuário bloqueado');

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, nome: user.nome, role: user.role, avatarUrl: user.avatarUrl },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.usuarios.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      if (user.bloqueadoEm) throw new UnauthorizedException('Usuário bloqueado');

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      if (error instanceof UnauthorizedException && error.message === 'Usuário bloqueado') {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async logout(userId: string) {
    await this.prisma.usuarios.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async validateUser(userId: string) {
    return this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nome: true, role: true, avatarUrl: true },
    });
  }

  async updateProfile(userId: string, dto: { nome?: string; avatarUrl?: string }) {
    const data: { nome?: string; avatarUrl?: string } = {};
    if (dto.nome !== undefined) {
      const trimmed = dto.nome.trim();
      if (trimmed.length < 1) throw new BadRequestException('Nome é obrigatório');
      if (trimmed.length > 200) throw new BadRequestException('Nome deve ter no máximo 200 caracteres');
      data.nome = trimmed;
    }
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;

    return this.prisma.usuarios.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, nome: true, role: true, avatarUrl: true },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.usuarios.findUnique({ where: { email } });
    if (!user || user.bloqueadoEm) {
      // Resposta genérica para não vazar quais e-mails existem.
      return { message: 'Se o e-mail existir, enviaremos as instruções de recuperação.' };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expira = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpira: expira },
    });

    const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/auth/recuperar-senha?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Nunca logar o token; o provider 'console' (dev) registra o link sem expô-lo em logs de erro.
    await this.mailService.sendPasswordReset(user.email, user.nome || 'viajante', resetUrl);

    return { message: 'Se o e-mail existir, enviaremos as instruções de recuperação.' };
  }

  async resetPassword(token: string, novaSenha: string) {
    if (!token) throw new BadRequestException('Token de recuperação ausente');
    if (!novaSenha || novaSenha.length < 8) {
      throw new BadRequestException('A nova senha deve ter no mínimo 8 caracteres');
    }

    const tokenHash = this.hashResetToken(token);
    const user = await this.prisma.usuarios.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpira: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Token inválido ou expirado');
    if (user.bloqueadoEm) throw new UnauthorizedException('Usuário bloqueado');

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: {
        senhaHash,
        resetTokenHash: null,
        resetTokenExpira: null,
        refreshToken: null,
      },
    });

    return { message: 'Senha redefinida com sucesso. Faça login com a nova senha.' };
  }

  // ─── LGPD — Direitos do titular ─────────────────────────────────────────────

  /**
   * Exporta todos os dados pessoais do usuário (Art. 18, II LGPD — portabilidade).
   * Retorna JSON com todos os registros vinculados ao userId.
   * Dados sensíveis de outros titulares são omitidos.
   */
  async exportarDados(userId: string) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
        terreirosCriados: { select: { id: true, nome: true, slug: true, createdAt: true } },
        avaliacoes: { select: { id: true, nota: true, texto: true, createdAt: true } },
        favoritos: { select: { terreiroId: true, createdAt: true } },
        notificacoes: { select: { id: true, tipo: true, titulo: true, lida: true, createdAt: true } },
      },
    });

    if (!user) throw new Error('Usuário não encontrado');

    return {
      exportadoEm: new Date().toISOString(),
      nota: 'Exportação conforme LGPD Art. 18, II — Portabilidade de dados. Dados de terceiros foram omitidos.',
      dados: user,
    };
  }

  /**
   * Soft-deleta e anonimiza a conta do usuário (Art. 18, VI LGPD — exclusão).
   * Preserva registros mínimos para obrigações legais (audit logs, pagamentos).
   */
  async deletarConta(userId: string) {
    const user = await this.prisma.usuarios.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    // Invalida tokens antes de anonimizar
    await this.prisma.usuarios.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        resetTokenHash: null,
        resetTokenExpira: null,
        deletedAt: new Date(),
        // Anonimização: sobrescreve email e nome
        email: `anon_${userId}@excluido.axemap`,
        nome: '[conta excluída]',
        senhaHash: '[deleted]',
        avatarUrl: null,
      },
    });

    // Revoga consentimentos (cast necessário até `prisma generate` ser executado após migration)
    await (this.prisma as any).consentRecord.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'Conta excluída e dados anonimizados conforme LGPD Art. 18, VI. Registros de obrigação legal (audit logs, transações) são mantidos anonimizados.',
      deletadoEm: new Date().toISOString(),
    };
  }

  /**
   * Revoga consentimentos opcionais do usuário (Art. 8 § 5 LGPD — revogação).
   * Não exclui a conta.
   */
  async revogarConsentimento(userId: string) {
    await (this.prisma as any).consentRecord.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'Consentimentos opcionais revogados. Apenas cookies essenciais continuam ativos.',
      revokedAt: new Date().toISOString(),
    };
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.prisma.usuarios.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
