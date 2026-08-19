import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { PesoRecomendacao, ContextoRecomendacao } from './recommendation.types';

@Controller('recommendation')
export class RecommendationController {
  constructor(private service: RecommendationService) {}

  @Post('recomendar')
  async recomendar(@Body() contexto: ContextoRecomendacao) {
    return this.service.recomendar(contexto);
  }

  @Post('home')
  async home(@Body() contexto: ContextoRecomendacao) {
    return this.service.home(contexto);
  }

  @Get('terreiro/:id')
  async paraTerreiro(@Param('id') id: string) {
    return this.service.recomendarParaTerreiro(id);
  }

  @Get('pesos')
  async getPesos() {
    return this.service.getPesos();
  }

  @Post('pesos')
  async atualizarPesos(@Body() pesos: Partial<PesoRecomendacao>) {
    return this.service.atualizarPesos(pesos);
  }

  @Post('pesos/resetar')
  async resetarPesos() {
    return this.service.resetarPesos();
  }
}
