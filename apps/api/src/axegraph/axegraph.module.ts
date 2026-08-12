import { Module } from '@nestjs/common';
import { AxegraphService } from './axegraph.service';
import { AxegraphPublicController, AxegraphUserController } from './axegraph.controller';
import { AxegraphAdminController } from './axegraph-admin.controller';

@Module({
  controllers: [AxegraphPublicController, AxegraphUserController, AxegraphAdminController],
  providers: [AxegraphService],
  exports: [AxegraphService],
})
export class AxegraphModule {}