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
import { TvService } from './tv.service';
import { SubmeterEpisodioDto } from './tv.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * TvController — endpoints públicos e de submissão da TV AxéMap.
 */
@Controller('tv')
export class TvController {
  constructor(private tvService: TvService) {}

  /** Episódios publicados — acesso público. */
  @Get()
  listar(
    @Query('tipo') tipo?: string,
    @Query('tradicao') tradicao?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.tvService.listarPublicados(tipo, tradicao, parseInt(limit) || 20, parseInt(offset) || 0);
  }

  /** Detalhe de um episódio pelo slug — acesso público. */
  @Get(':slug')
  obterPorSlug(@Param('slug') slug: string) {
    return this.tvService.obterPorSlug(slug);
  }

  /** Submeter conteúdo para a TV (requer autenticação). */
  @Post('submeter')
  @UseGuards(AuthGuard('jwt'))
  submeter(
    @Body() dto: SubmeterEpisodioDto,
    @CurrentUser() user: any,
  ) {
    return this.tvService.submeter(dto, user.id);
  }
}
