import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdsService } from './ads.service';
import { AdPlacement, CreateAdOrderDto } from './ads.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * AdsController — endpoints públicos e de anunciante.
 *
 * Nota: anúncios publicados SEMPRE incluem campo `rotulo: "PATROCINADO"`.
 * Publicidade nunca altera Trust, verificação ou ranking orgânico.
 */
@Controller('ads')
export class AdsController {
  constructor(private adsService: AdsService) {}

  /** Anúncios publicados para um placement (frontend rendering). */
  @Get('publicados')
  listarPublicados(
    @Query('placement') placement?: AdPlacement,
    @Query('cidade') cidade?: string,
  ) {
    return this.adsService.listarPublicados(placement, cidade);
  }

  /** Criar pedido de anúncio (requer autenticação). */
  @Post('pedidos')
  @UseGuards(AuthGuard('jwt'))
  criarPedido(
    @Body() dto: CreateAdOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.adsService.criarPedido(dto, user.id);
  }

  /** Meus pedidos (anunciante autenticado). */
  @Get('pedidos/meus')
  @UseGuards(AuthGuard('jwt'))
  meusPedidos(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @CurrentUser() user: any,
  ) {
    return this.adsService.meusPedidos(user.id, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  /** Detalhe de um pedido (anunciante ou admin). */
  @Get('pedidos/:id')
  @UseGuards(AuthGuard('jwt'))
  detalhePedido(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.detalhePedido(id, user.id, false);
  }

  /** Registrar impressão (chamado pelo frontend ao exibir o anúncio). */
  @Post(':id/impressao')
  registrarImpressao(@Param('id') id: string) {
    return this.adsService.registrarImpressao(id);
  }

  /** Registrar clique (chamado pelo frontend). */
  @Post(':id/clique')
  registrarClique(@Param('id') id: string) {
    return this.adsService.registrarClique(id);
  }
}
