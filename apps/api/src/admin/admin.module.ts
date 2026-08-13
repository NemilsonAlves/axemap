import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsuariosAdminController } from './usuarios-admin.controller';
import { UsuariosAdminService } from './usuarios-admin.service';
import { DashboardAdminController } from './dashboard-admin.controller';
import { DashboardAdminService } from './dashboard-admin.service';
import { MonitorAdminController } from './monitor-admin.controller';
import { MonitorAdminService } from './monitor-admin.service';
import { ModerationAdminController } from './moderacao-admin.controller';
import { ModerationAdminService } from './moderacao-admin.service';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [OnboardingModule, SystemModule],
  controllers: [
    AdminController,
    UsuariosAdminController,
    DashboardAdminController,
    MonitorAdminController,
    ModerationAdminController,
  ],
  providers: [
    AdminService,
    UsuariosAdminService,
    DashboardAdminService,
    MonitorAdminService,
    ModerationAdminService,
  ],
  exports: [AdminService, UsuariosAdminService, DashboardAdminService],
})
export class AdminModule {}
