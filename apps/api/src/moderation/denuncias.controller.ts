import { Controller, Post, Get, Body, Param, Query, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ModerationService } from './moderation.service';

@Controller('denuncias')
export class DenunciasController {
  constructor(
    private moderationService: ModerationService,
    private jwtService: JwtService,
  ) {}

  /**
   * Denúncia pública — funciona logado ou anônimo (com e-mail de contato opcional).
   * Conforme o fluxo da Central de Proteção: Denúncia → Triagem → Evidências → Resposta → Decisão → Recurso.
   */
  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async denunciar(
    @Req() req: { headers: Record<string, string | undefined> },
    @Body() dto: any,
  ) {
    const authHeader = req.headers.authorization;
    let usuarioId: string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync(authHeader.slice(7));
        usuarioId = (payload as any).sub as string;
      } catch {
        usuarioId = undefined;
      }
    }
    return this.moderationService.denunciar({ ...dto, usuarioId });
  }

  /** Acompanhamento público de status por protocolo — dados não sensíveis. */
  @Get('protocolo/:protocolo')
  async consultar(@Param('protocolo') protocolo: string) {
    return this.moderationService.consultarPorProtocolo(protocolo);
  }

  /** Denúncias do usuário logado (JWT obrigatório). */
  @Get('me')
  async minhas(
    @Req() req: { headers: Record<string, string | undefined> },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return { data: [], total: 0 };
    }
    try {
      const payload = await this.jwtService.verifyAsync(authHeader.slice(7));
      const usuarioId = (payload as any).sub as string;
      return this.moderationService.listarMinhas(
        usuarioId,
        limit ? parseInt(limit, 10) : 50,
        offset ? parseInt(offset, 10) : 0,
      );
    } catch {
      return { data: [], total: 0 };
    }
  }
}