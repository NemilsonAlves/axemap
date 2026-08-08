import { Controller, Get, Param } from '@nestjs/common';
import { TrustScoreService } from './trust-score.service';

@Controller('terreiros')
export class TrustScoreController {
  constructor(private trustScoreService: TrustScoreService) {}

  @Get(':id/trust-score')
  async obter(@Param('id') id: string) {
    return this.trustScoreService.recalcular(id);
  }
}
