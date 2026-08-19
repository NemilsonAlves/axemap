import { Module } from '@nestjs/common';
import { ApoieController } from './apoie.controller';
import { ApoieAdminController } from './apoie-admin.controller';
import { ApoieService } from './apoie.service';

@Module({
  controllers: [ApoieController, ApoieAdminController],
  providers: [ApoieService],
  exports: [ApoieService],
})
export class ApoieModule {}
