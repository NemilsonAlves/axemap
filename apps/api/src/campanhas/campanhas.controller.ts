import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampanhasService } from './campanhas.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('campanhas')
export class CampanhasController {
  constructor(private campanhasService: CampanhasService) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('categoria') categoria?: string,
    @Query('estado') estado?: string,
    @Query('modelo') modelo?: string,
    @Query('nivel') nivel?: string,
    @Query('terreiroId') terreiroId?: string,
    @Query('limit') limit = '18',
    @Query('offset') offset = '0',
  ) {
    return this.campanhasService.listar({
      q,
      categoria,
      estado,
      modelo,
      nivel,
      terreiroId,
      limit: parseInt(limit) || 18,
      offset: parseInt(offset) || 0,
    });
  }

  @Get('mapa')
  async mapa() {
    return this.campanhasService.mapa();
  }

  @Get('instituicoes')
  async instituicoes(@Query('limit') limit = '100') {
    return this.campanhasService.instituicoes(parseInt(limit) || 100);
  }

  @Get(':slug')
  async detalhe(@Param('slug') slug: string) {
    return this.campanhasService.detalhe(slug);
  }

  @Post(':slug/apoiar')
  @UseGuards(AuthGuard('jwt'))
  async apoiar(
    @Param('slug') slug: string,
    @Body() dto: { valor: number; mensagem?: string; anonimo?: boolean; recorrencia?: string },
    @CurrentUser() user: any,
  ) {
    return this.campanhasService.apoiar(slug, user.id, dto);
  }

  @Post(':slug/comentarios')
  @UseGuards(AuthGuard('jwt'))
  async comentar(
    @Param('slug') slug: string,
    @Body() dto: { texto: string },
    @CurrentUser() user: any,
  ) {
    return this.campanhasService.comentar(slug, user.id, dto);
  }

  @Get(':slug/comentarios')
  async comentarios(@Param('slug') slug: string) {
    return this.campanhasService.comentarios(slug);
  }
}