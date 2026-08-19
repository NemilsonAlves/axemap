import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TvService } from './tv.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * TvAdminController — moderação de episódios da TV AxéMap.
 * Requer autenticação. RBAC verificado no guard ou no service.
 */
@Controller('admin/tv')
@UseGuards(AuthGuard('jwt'))
export class TvAdminController {
  constructor(private tvService: TvService) {}

  /** Lista todos os episódios (com filtro de status). */
  @Get()
  listar(
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.tvService.listarAdmin(status, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  /** Aprovar episódio. */
  @Post(':id/aprovar')
  aprovar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tvService.aprovar(id, user.id);
  }

  /** Publicar episódio aprovado. */
  @Post(':id/publicar')
  publicar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tvService.publicar(id, user.id);
  }

  /** Rejeitar episódio. */
  @Post(':id/rejeitar')
  rejeitar(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: any,
  ) {
    return this.tvService.rejeitar(id, user.id, motivo);
  }
}
