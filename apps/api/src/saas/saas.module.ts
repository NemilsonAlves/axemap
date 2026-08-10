import { Module } from '@nestjs/common';
import { SaasService } from './saas.service';
import { PlanosController } from './planos.controller';
import { SaasAdminController } from './saas-admin.controller';

@Module({
  controllers: [PlanosController, SaasAdminController],
  providers: [SaasService],
  exports: [SaasService],
})
export class SaasModule {}