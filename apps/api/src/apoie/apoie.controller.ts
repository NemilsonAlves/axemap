import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApoieService } from './apoie.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApoioPeriodicidade } from '@axemap/shared';

@Controller('apoie')
export class ApoieController {
  constructor(private apoieService: ApoieService) {}

  /** Catálogo público de níveis do Círculo de Apoiadores. */
  @Get('niveis')
  niveis() {
    return this.apoieService.listarNiveis();
  }

  /** Transparência financeira pública da plataforma. */
  @Get('transparencia')
  transparencia() {
    return this.apoieService.transparencia();
  }

  /** Registra uma contribuição à plataforma (usuário autenticado). */
  @Post('contribuir')
  @UseGuards(AuthGuard('jwt'))
  contribuir(
    @Body() dto: { nivel: string; periodicidade?: ApoioPeriodicidade; anonimo?: boolean; mensagem?: string },
    @CurrentUser() user: any,
  ) {
    return this.apoieService.contribuir(user.id, dto);
  }

  /** Contribuições do usuário autenticado. */
  @Get('minhas-contribuicoes')
  @UseGuards(AuthGuard('jwt'))
  minhasContribuicoes(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @CurrentUser() user: any,
  ) {
    return this.apoieService.minhasContribuicoes(user.id, parseInt(limit) || 50, parseInt(offset) || 0);
  }
}
