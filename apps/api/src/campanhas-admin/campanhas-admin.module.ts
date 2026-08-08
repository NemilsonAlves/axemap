import { Module } from '@nestjs/common';
import { CampanhasAdminController } from './campanhas-admin.controller';
import { CampanhasAdminService } from './campanhas-admin.service';

@Module({
  controllers: [CampanhasAdminController],
  providers: [CampanhasAdminService],
  exports: [CampanhasAdminService],
})
export class CampanhasAdminModule {}