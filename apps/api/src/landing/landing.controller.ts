import { Controller, Get, Param, Query } from '@nestjs/common';
import { LandingService } from './landing.service';

@Controller('landing')
export class LandingController {
  constructor(private landingService: LandingService) {}

  @Get('estado/:uf')
  async landingEstado(@Param('uf') uf: string) {
    return this.landingService.landingEstado(uf);
  }

  @Get('cidade/:cidade')
  async landingCidade(@Param('cidade') cidade: string) {
    return this.landingService.landingCidade(cidade);
  }

  @Get('tradicao/:tradicao')
  async landingTradicao(@Param('tradicao') tradicao: string) {
    return this.landingService.landingTradicao(tradicao);
  }

  @Get('cidade/:cidade/:tradicao')
  async landingCidadeTradicao(
    @Param('cidade') cidade: string,
    @Param('tradicao') tradicao: string,
  ) {
    return this.landingService.landingCidadeTradicao(cidade, tradicao);
  }

  @Get('eventos')
  async eventos(@Query('local') local?: string) {
    return this.landingService.eventos(local);
  }

  @Get('cursos')
  async cursos(@Query('tradicao') tradicao?: string) {
    return this.landingService.cursos(tradicao);
  }

  @Get('acoes-sociais')
  async acoesSociais() {
    return this.landingService.acoesSociais();
  }

  @Get('verificados')
  async verificados() {
    return this.landingService.verificados();
  }

  @Get('top')
  async topAvaliados() {
    return this.landingService.topAvaliados();
  }

  @Get('recentes')
  async recentes() {
    return this.landingService.recentes();
  }

  @Get('stats')
  async stats() {
    return this.landingService.stats();
  }

  @Get('sitemap')
  async sitemap() {
    return this.landingService.sitemapData();
  }
}
