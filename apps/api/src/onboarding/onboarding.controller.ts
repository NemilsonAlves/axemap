import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OnboardingService } from './onboarding.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('onboarding/steps')
  async getSteps() {
    return this.onboardingService.getSteps();
  }

  @Post('onboarding/criar')
  @UseGuards(AuthGuard('jwt'))
  async criarMinimo(
    @Body() dto: {
      nome: string; cidade: string; estado: string;
      latitude: number; longitude: number; whatsapp: string;
      tradicao?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.onboardingService.criarMinimo(dto, user.id);
  }

  @Post('terreiros/:id/reivindicar')
  @UseGuards(AuthGuard('jwt'))
  async reivindicar(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('mensagem') mensagem?: string,
  ) {
    return this.onboardingService.reivindicar(user.id, id, mensagem);
  }

  @Get('terreiros/:id/reivindicacao')
  @UseGuards(AuthGuard('jwt'))
  async statusReivindicacao(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.onboardingService.getReivindicacaoStatus(user.id, id);
  }
}
