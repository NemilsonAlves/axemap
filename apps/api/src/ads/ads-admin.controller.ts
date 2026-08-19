import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * AdsAdminController — moderação de anúncios.
 *
 * REGRA: aprovar/publicar um anúncio NUNCA altera Trust Score,
 * verificação, certificação ou posição orgânica de nenhuma entidade.
 */
@Controller('admin/ads')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class AdsAdminController {
  constructor(private adsService: AdsService) {}

  @Get('campanhas')
  listar(
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.adsService.listarAdmin(status, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('campanhas/:id')
  detalhe(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.detalhePedido(id, user.id, true);
  }

  @Post('campanhas/:id/aprovar')
  aprovar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.aprovar(id, user.id);
  }

  @Post('campanhas/:id/publicar')
  publicar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.publicar(id, user.id);
  }

  @Post('campanhas/:id/pausar')
  pausar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.pausar(id, user.id);
  }

  @Post('campanhas/:id/rejeitar')
  rejeitar(
    @Param('id') id: string,
    @Body('motivo') motivo: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.adsService.rejeitar(id, user.id, motivo);
  }

  @Post('campanhas/:id/bloquear')
  bloquear(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adsService.bloquear(id, user.id);
  }
}
