import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
