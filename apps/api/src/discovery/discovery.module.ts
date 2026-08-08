import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [DatabaseModule, RecommendationModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
