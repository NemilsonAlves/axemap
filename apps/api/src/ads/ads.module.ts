import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsAdminController } from './ads-admin.controller';
import { AdsService } from './ads.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [AdsController, AdsAdminController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
