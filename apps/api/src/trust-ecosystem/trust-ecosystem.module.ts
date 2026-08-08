import { Module } from '@nestjs/common';
import { TrustEcosystemService } from './trust-ecosystem.service';
import { TrustPublicController } from './trust-public.controller';
import { TrustAdminController } from './trust-admin.controller';

@Module({
  controllers: [TrustPublicController, TrustAdminController],
  providers: [TrustEcosystemService],
  exports: [TrustEcosystemService],
})
export class TrustEcosystemModule {}