import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitorAdminService } from './monitor-admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class MonitorAdminController {
  constructor(private monitorAdminService: MonitorAdminService) {}

  @Get('mapa')
  mapa() {
    return this.monitorAdminService.mapa();
  }

  @Get('integracoes')
  integracoes() {
    return this.monitorAdminService.integracoes();
  }

  @Get('jobs')
  jobs() {
    return this.monitorAdminService.jobs();
  }
}
