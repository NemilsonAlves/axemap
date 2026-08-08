import { Controller, Get, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private service: DiscoveryService) {}

  @Get('trending')
  async trending() {
    return this.service.trending();
  }

  @Get('eventos-em-alta')
  async eventosEmAlta() {
    return this.service.eventosEmAlta();
  }

  @Get('explore')
  async explore(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.service.explore(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    );
  }
}
