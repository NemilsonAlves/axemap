import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const MODERACAO_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR];

@Controller('admin/moderation')
@UseGuards(RolesGuard)
@Roles(...MODERACAO_ROLES)
export class AdminModerationController {
  constructor(
    private moderationService: ModerationService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async listar(
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.moderationService.listar(status, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post(':id/resolver')
  async resolver(
    @Param('id') id: string,
    @Body('bloquear') bloquear: boolean | string = false,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const resultado = await this.moderationService.resolver(id, user.id, bloquear === true || bloquear === 'true');
    await this.auditLogsService.registrar(user.id, 'MODERACAO_RESOLVER', 'DENUNCIA', id, {
      depois: resultado,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return resultado;
  }
}
