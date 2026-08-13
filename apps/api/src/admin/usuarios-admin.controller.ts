import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { UsuariosAdminService } from './usuarios-admin.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/usuarios')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class UsuariosAdminController {
  constructor(
    private usuariosAdminService: UsuariosAdminService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async listar(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.usuariosAdminService.listarUsuarios(
      q,
      role,
      status,
      parseInt(limit) || 50,
      parseInt(offset) || 0,
    );
  }

  @Get(':id')
  async detalhar(@Param('id') id: string) {
    return this.usuariosAdminService.detalharUsuario(id);
  }

  @Post(':id/bloquear')
  async bloquear(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.usuariosAdminService.bloquearUsuario(id, user.id, motivo);
    await this.auditLogsService.registrar(user.id, 'USUARIO_BLOQUEAR', 'USUARIO', id, {
      depois: { motivo },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/desbloquear')
  async desbloquear(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.usuariosAdminService.desbloquearUsuario(id);
    await this.auditLogsService.registrar(user.id, 'USUARIO_DESBLOQUEAR', 'USUARIO', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Patch(':id/role')
  async alterarRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.usuariosAdminService.alterarRole(id, role, user.id, user.role);
    await this.auditLogsService.registrar(user.id, 'USUARIO_ROLE', 'USUARIO', id, {
      depois: { role },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}
