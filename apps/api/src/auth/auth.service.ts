import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: { email: string; nome: string; senha: string }) {
    const existing = await this.prisma.usuarios.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email já cadastrado');

    if (dto.senha.length < 8) throw new UnauthorizedException('Senha deve ter no mínimo 8 caracteres');

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const user = await this.prisma.usuarios.create({
      data: { email: dto.email, nome: dto.nome, senhaHash },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, nome: user.nome, role: user.role },
      ...tokens,
    };
  }

  async login(dto: { email: string; senha: string }) {
    const user = await this.prisma.usuarios.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isValid = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!isValid) throw new UnauthorizedException('Credenciais inválidas');

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: { id: user.id, email: user.email, nome: user.nome, role: user.role },
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

      return this.generateTokens(user.id, user.email);
    } catch {
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
      select: { id: true, email: true, nome: true, role: true },
    });
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
