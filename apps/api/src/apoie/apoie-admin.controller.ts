import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApoieService } from './apoie.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/apoie')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class ApoieAdminController {
  constructor(
    private apoieService: ApoieService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get('contribuicoes')
  async listar(
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.apoieService.listarContribuicoes(status, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('contribuicoes/:id/confirmar')
  async confirmar(@Param('id') id: string, @CurrentUser() user: any) {
    const resultado = await this.apoieService.confirmar(id, user.id);
    await this.auditLogsService.registrar(user.id, 'APOIE_CONFIRMAR', 'APOIO_PLATAFORMA', id, {
      depois: { status: resultado.status, valor: resultado.valor },
    });
    return resultado;
  }

  @Post('contribuicoes/:id/recusar')
  async recusar(@Param('id') id: string, @CurrentUser() user: any) {
    const resultado = await this.apoieService.recusar(id, user.id);
    await this.auditLogsService.registrar(user.id, 'APOIE_RECUSAR', 'APOIO_PLATAFORMA', id, {
      depois: { status: resultado.status, valor: resultado.valor },
    });
    return resultado;
  }
}
