import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EvolutionService } from './evolution.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('evolucao')
@UseGuards(AuthGuard('jwt'))
export class EvolutionController {
  constructor(private evolutionService: EvolutionService) {}

  @Get('me')
  async minhaEvolucao(@CurrentUser() user: any) {
    return this.evolutionService.getMyDashboard(user.id);
  }

  @Get(':terreiroId')
  async dashboard(
    @Param('terreiroId') terreiroId: string,
    @CurrentUser() user: any,
  ) {
    return this.evolutionService.getDashboard(terreiroId, user.id);
  }

  @Post(':terreiroId/acoes')
  async logAction(
    @Param('terreiroId') terreiroId: string,
    @CurrentUser() user: any,
    @Body() body: { actionType: string; descricao: string; metadata?: any },
  ) {
    return this.evolutionService.logAction(
      terreiroId, user.id, body.actionType, body.descricao, body.metadata,
    );
  }

  @Post(':terreiroId/avaliar')
  async avaliarMissoes(
    @Param('terreiroId') terreiroId: string,
    @CurrentUser() user: any,
  ) {
    await this.evolutionService.evaluateMissions(terreiroId, user.id);
    await this.evolutionService.evaluateAchievements(terreiroId, user.id);
    return { success: true };
  }

  @Post(':terreiroId/metas')
  async createGoal(
    @Param('terreiroId') terreiroId: string,
    @CurrentUser() user: any,
    @Body() body: { titulo: string; descricao?: string; targetDate?: string },
  ) {
    return this.evolutionService.createGoal(terreiroId, body);
  }

  @Patch('metas/:goalId/completar')
  async completeGoal(@Param('goalId') goalId: string) {
    return this.evolutionService.completeGoal(goalId);
  }
}
