import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private service: RankingService) {}

  @Get('trust-score')
  async topTrustScore() {
    return this.service.topTrustScore();
  }

  @Get('favoritos')
  async maisFavoritados() {
    return this.service.maisFavoritados();
  }

  @Get('avaliacoes')
  async maisAvaliados() {
    return this.service.maisAvaliados();
  }

  @Get('crescimento')
  async maiorCrescimento() {
    return this.service.maiorCrescimento();
  }

  @Get('eventos')
  async melhoresEventos() {
    return this.service.melhoresEventos();
  }

  @Get('cursos')
  async melhoresCursos() {
    return this.service.melhoresCursos();
  }
}
