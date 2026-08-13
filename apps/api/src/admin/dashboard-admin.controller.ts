import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardAdminService } from './dashboard-admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class DashboardAdminController {
  constructor(private dashboardAdminService: DashboardAdminService) {}

  @Get('dashboard')
  obterDashboard() {
    return this.dashboardAdminService.obterDashboard();
  }
}
