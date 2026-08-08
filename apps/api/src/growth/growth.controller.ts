import {
  Controller, Get, Post, Delete, Patch, Param, Query, Body, UseGuards, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GrowthService } from './growth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('growth')
export class GrowthController {
  constructor(private growthService: GrowthService) {}

  @Post('terreiros/:id/seguir')
  @UseGuards(AuthGuard('jwt'))
  async seguir(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.followTerreiro(user.id, id);
  }

  @Delete('terreiros/:id/seguir')
  @UseGuards(AuthGuard('jwt'))
  async deixarSeguir(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.unfollowTerreiro(user.id, id);
  }

  @Post('terreiros/:id/favoritar')
  @UseGuards(AuthGuard('jwt'))
  async favoritar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.favoriteTerreiro(user.id, id);
  }

  @Delete('terreiros/:id/favoritar')
  @UseGuards(AuthGuard('jwt'))
  async desfavoritar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.unfavoriteTerreiro(user.id, id);
  }

  @Get('terreiros/:id/seguidores')
  async listarSeguidores(@Param('id') id: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.growthService.getSeguidores(id, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
  }

  @Get('favoritos')
  @UseGuards(AuthGuard('jwt'))
  async meusFavoritos(@CurrentUser() user: any, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.growthService.listarFavoritos(user.id, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
  }

  @Post('eventos/:id/presenca')
  @UseGuards(AuthGuard('jwt'))
  async presenca(@Param('id') id: string, @CurrentUser() user: any, @Body('status') status?: string) {
    return this.growthService.confirmarPresenca(user.id, id, status || 'CONFIRMADO');
  }

  @Delete('eventos/:id/presenca')
  @UseGuards(AuthGuard('jwt'))
  async removerPresenca(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.removerPresenca(user.id, id);
  }

  @Post('terreiros/:id/membros/convidar')
  @UseGuards(AuthGuard('jwt'))
  async convidarMembro(
    @Param('id') id: string, @CurrentUser() user: any,
    @Body() body: { email: string; papel?: string },
  ) {
    return this.growthService.convidarMembro(user.id, user.role, id, body.email, body.papel);
  }

  @Post('terreiros/:id/membros/aceitar')
  @UseGuards(AuthGuard('jwt'))
  async aceitarConvite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.aceitarConvite(user.id, id);
  }

  @Delete('terreiros/:id/membros/recusar')
  @UseGuards(AuthGuard('jwt'))
  async recusarConvite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.recusarConvite(user.id, id);
  }

  @Get('terreiros/:id/membros')
  @UseGuards(AuthGuard('jwt'))
  async listarMembros(@Param('id') id: string, @CurrentUser() user: any) {
    await this.growthService.verificarDirigente(user.id, user.role, id);
    return this.growthService.getMembros(id);
  }

  @Get('convites')
  @UseGuards(AuthGuard('jwt'))
  async meusConvites(@CurrentUser() user: any) {
    return this.growthService.convitesParaUsuario(user.id);
  }

  @Patch('membros/:id')
  @UseGuards(AuthGuard('jwt'))
  async atualizarPapel(@Param('id') id: string, @Body('papel') papel: string, @CurrentUser() user: any) {
    return this.growthService.updateMembroPapel(user.id, user.role, id, papel);
  }

  @Delete('membros/:id')
  @UseGuards(AuthGuard('jwt'))
  async removerMembro(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.removerMembro(user.id, user.role, id);
  }

  @Post('indicacoes')
  @UseGuards(AuthGuard('jwt'))
  async indicar(@CurrentUser() user: any, @Body() body: { email: string; terreiroId?: string }) {
    return this.growthService.criarIndicacao(user.id, body.email, body.terreiroId);
  }

  @Get('terreiros/:id/qrcode')
  async getQRCode(@Param('id') id: string, @Req() req: any) {
    const data = await this.growthService.getDadosQRCode(id);
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    await this.growthService.registrarAcessoQRCode(id, userAgent, ip);
    return data;
  }

  @Get('terreiros/:id/analytics')
  @UseGuards(AuthGuard('jwt'))
  async getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.growthService.getGrowthAnalytics(user.id, user.role, id);
  }
}
