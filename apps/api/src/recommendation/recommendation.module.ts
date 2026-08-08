import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationEngine } from './recommendation-engine.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationEngine],
  exports: [RecommendationService, RecommendationEngine],
})
export class RecommendationModule {}
