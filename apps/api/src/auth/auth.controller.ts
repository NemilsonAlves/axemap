import { Controller, Post, Get, Patch, Delete, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async forgotPassword(@Body() dto: { email: string }) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async resetPassword(@Body() dto: { token: string; novaSenha: string }) {
    return this.authService.resetPassword(dto.token, dto.novaSenha);
  }

  @Post('signup')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async signup(@Body() dto: { email: string; nome: string; senha: string }) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: { email: string; senha: string }) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: { refreshToken: string }) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@CurrentUser() user: any) {
    return this.authService.validateUser(user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(@CurrentUser() user: any, @Body() dto: { nome?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(user.id, dto);
  }

  // ─── LGPD — Direitos do titular (Art. 18 LGPD) ─────────────────────────────

  /**
   * GET /auth/exportar-dados
   * Exporta todos os dados do usuário autenticado (portabilidade / acesso).
   */
  @Get('exportar-dados')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async exportarDados(@CurrentUser() user: any) {
    return this.authService.exportarDados(user.id);
  }

  /**
   * DELETE /auth/conta
   * Inicia o fluxo de exclusão/anonimização da conta (soft-delete).
   */
  @Delete('conta')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async deletarConta(@CurrentUser() user: any) {
    return this.authService.deletarConta(user.id);
  }

  /**
   * POST /auth/revogar-consentimento
   * Revoga todos os consentimentos opcionais do usuário.
   */
  @Post('revogar-consentimento')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async revogarConsentimento(@CurrentUser() user: any) {
    return this.authService.revogarConsentimento(user.id);
  }
}
