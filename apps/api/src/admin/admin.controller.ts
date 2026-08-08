import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private onboardingService: OnboardingService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get('terreiros/pendentes')
  async pendentes() {
    return this.adminService.painelPendentes();
  }

  @Get('terreiros')
  async listarTerreiros(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.adminService.listarTerreiros(status, q, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('audit-logs')
  async listarAuditLogs(
    @Query('entidadeTipo') entidadeTipo?: string,
    @Query('entidadeId') entidadeId?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.auditLogsService.listar(entidadeTipo, entidadeId, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('terreiros/:id/status')
  async atualizarStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.adminService.atualizarStatus(id, status);
    await this.auditLogsService.registrar(user.id, 'TERREIRO_STATUS', 'TERREIRO', id, {
      depois: { status: result.status, isPublished: result.isPublished },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('reivindicacoes/:requestId/aprovar')
  async aprovarReivindicacao(@Param('requestId') requestId: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.onboardingService.aprovarReivindicacao(requestId, user.id);
    await this.auditLogsService.registrar(user.id, 'REIVINDICACAO_APROVAR', 'REIVINDICACAO', requestId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('reivindicacoes/:requestId/recusar')
  async recusarReivindicacao(@Param('requestId') requestId: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.onboardingService.recusarReivindicacao(requestId, user.id);
    await this.auditLogsService.registrar(user.id, 'REIVINDICACAO_RECUSAR', 'REIVINDICACAO', requestId, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
