import { Module } from '@nestjs/common';
import { TerreiroController } from './terreiro.controller';
import { TerreiroService } from './terreiro.service';

@Module({
  controllers: [TerreiroController],
  providers: [TerreiroService],
  exports: [TerreiroService],
})
export class TerreiroModule {}
