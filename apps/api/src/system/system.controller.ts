import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get('health')
  health() {
    return this.system.health();
  }

  @Get('readiness')
  readiness() {
    return this.system.readiness();
  }

  @Get('liveness')
  liveness() {
    return this.system.liveness();
  }

  @Get('status')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  status() {
    return this.system.status();
  }

  @Get('version')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  version() {
    return this.system.version();
  }

  @Get('metrics')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  metrics() {
    return this.system.metrics();
  }
}
