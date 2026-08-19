import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ConsentService } from './consent.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('consent')
export class ConsentController {
  constructor(private consentService: ConsentService) {}

  /**
   * POST /consent
   * Registra consentimento do titular (autenticado ou anônimo via sessionId).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registrar(
    @Body()
    body: {
      sessionId?: string;
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
      source?: 'banner' | 'settings' | 'api';
    },
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      undefined;

    return this.consentService.registrar({
      sessionId: body.sessionId,
      essential: true,
      analytics: body.analytics ?? false,
      marketing: body.marketing ?? false,
      preferences: body.preferences ?? false,
      source: body.source ?? 'banner',
      rawIp,
      rawUserAgent: userAgent,
    });
  }

  /**
   * POST /consent/autenticado
   * Registra consentimento vinculando ao usuário autenticado.
   */
  @Post('autenticado')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async registrarAutenticado(
    @Body()
    body: {
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
      source?: 'banner' | 'settings' | 'api';
    },
    @CurrentUser() user: any,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      undefined;

    return this.consentService.registrar({
      userId: user.id,
      essential: true,
      analytics: body.analytics ?? false,
      marketing: body.marketing ?? false,
      preferences: body.preferences ?? false,
      source: body.source ?? 'settings',
      rawIp,
      rawUserAgent: userAgent,
    });
  }

  /**
   * GET /consent/meu-historico
   * Retorna histórico de consentimentos do usuário autenticado.
   */
  @Get('meu-historico')
  @UseGuards(AuthGuard('jwt'))
  async meuHistorico(@CurrentUser() user: any) {
    return this.consentService.listarPorUsuario(user.id);
  }
}
