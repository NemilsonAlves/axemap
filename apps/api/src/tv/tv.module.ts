import { Module } from '@nestjs/common';
import { TvController } from './tv.controller';
import { TvAdminController } from './tv-admin.controller';
import { TvService } from './tv.service';
import { DatabaseModule } from '../database/database.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [DatabaseModule, AuditLogsModule],
  controllers: [TvController, TvAdminController],
  providers: [TvService],
  exports: [TvService],
})
export class TvModule {}
