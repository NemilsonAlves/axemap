import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ModerationAdminService } from './moderacao-admin.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class ModerationAdminController {
  constructor(
    private moderationAdminService: ModerationAdminService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get('eventos')
  async listarEventos(
    @Query('q') q?: string,
    @Query('arquivados') arquivados?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.moderationAdminService.listarEventos(q, arquivados, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('eventos/:id/arquivar')
  async arquivarEvento(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.arquivarEvento(id);
    await this.auditLogsService.registrar(user.id, 'EVENTO_ARQUIVAR', 'EVENTO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('eventos/:id/restaurar')
  async restaurarEvento(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.restaurarEvento(id);
    await this.auditLogsService.registrar(user.id, 'EVENTO_RESTAURAR', 'EVENTO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Get('organizacoes')
  async listarOrganizacoes(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.moderationAdminService.listarOrganizacoes(q, status, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('organizacoes/:id/publicar')
  async publicarOrganizacao(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.publicarOrganizacao(id);
    await this.auditLogsService.registrar(user.id, 'ORGANIZACAO_PUBLICAR', 'ORGANIZACAO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('organizacoes/:id/arquivar')
  async arquivarOrganizacao(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.arquivarOrganizacao(id);
    await this.auditLogsService.registrar(user.id, 'ORGANIZACAO_ARQUIVAR', 'ORGANIZACAO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Get('avaliacoes')
  async listarAvaliacoes(
    @Query('q') q?: string,
    @Query('minNota') minNota?: string,
    @Query('ocultas') ocultas?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.moderationAdminService.listarAvaliacoes(q, minNota, ocultas, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('avaliacoes/:id/ocultar')
  async ocultarAvaliacao(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.ocultarAvaliacao(id);
    await this.auditLogsService.registrar(user.id, 'AVALIACAO_OCULTAR', 'AVALIACAO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('avaliacoes/:id/restaurar')
  async restaurarAvaliacao(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.moderationAdminService.restaurarAvaliacao(id);
    await this.auditLogsService.registrar(user.id, 'AVALIACAO_RESTAURAR', 'AVALIACAO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
