import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { GeoService } from './geo.service';

@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Get('raio')
  async raio(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('raio', ParseFloatPipe) raio: number,
  ) {
    return this.geoService.buscarPorRaio(lat, lng, raio);
  }

  @Get('bounding-box')
  async boundingBox(
    @Query('norte', ParseFloatPipe) norte: number,
    @Query('sul', ParseFloatPipe) sul: number,
    @Query('leste', ParseFloatPipe) leste: number,
    @Query('oeste', ParseFloatPipe) oeste: number,
  ) {
    return this.geoService.buscarPorBoundingBox(norte, sul, leste, oeste);
  }

  @Get('proximos')
  async proximos(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('limite') limite?: string,
  ) {
    return this.geoService.buscarProximos(lat, lng, limite ? parseInt(limite) : 10);
  }

  @Get('cidades')
  async cidades() {
    return this.geoService.contarPorCidade();
  }
}
