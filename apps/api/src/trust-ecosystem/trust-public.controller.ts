import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrustEcosystemService } from './trust-ecosystem.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('trust')
export class TrustPublicController {
  constructor(private readonly trust: TrustEcosystemService) {}

  @Get('terreiros/:slug/certificados')
  certificados(@Param('slug') slug: string) {
    return this.trust.certificadosDoTerreiro(slug);
  }

  @Get('certificados/verificar/:codigo')
  verificar(@Param('codigo') codigo: string) {
    return this.trust.verificarCertificado(codigo);
  }

  @Get('terreiros/:slug/central-transparencia')
  transparencia(@Param('slug') slug: string) {
    return this.trust.transparencia(slug);
  }

  @Get('terreiros/:slug/mediacoes')
  mediacoes(@Param('slug') slug: string) {
    return this.trust.mediacoesDaCentral(slug);
  }

  @Get('governanca')
  governanca() {
    return this.trust.conselho();
  }

  // Criação de mediação pelo reclamante autenticado.
  @Post('mediacoes')
  @UseGuards(AuthGuard('jwt'))
  criarMediacao(
    @Body() dto: { terreiroId: string; assunto: string; descricao: string },
    @CurrentUser() user: any,
  ) {
    return this.trust.criarMediacao(dto, user.id);
  }

  @Get('mediacoes/:id')
  @UseGuards(AuthGuard('jwt'))
  detalheMediacao(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trust.detalheMediacao(id, user.id, user.role);
  }

  @Post('mediacoes/:id/mensagens')
  @UseGuards(AuthGuard('jwt'))
  enviarMensagem(@Param('id') id: string, @Body('texto') texto: string, @CurrentUser() user: any) {
    return this.trust.enviarMensagemMediacao(id, texto, user.id, user.role);
  }

  @Get('mediacoes')
  @UseGuards(AuthGuard('jwt'))
  minhasMediacoes(@CurrentUser() user: any) {
    return this.trust.listarMediacoesDoUsuario(user.id);
  }
}