import { Module } from '@nestjs/common';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LandingController],
  providers: [LandingService],
})
export class LandingModule {}
