import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async track(
    @Body() body: {
      evento: string;
      sessaoId?: string;
      origem?: string;
      dispositivo?: string;
      versao?: string;
      metadata?: any;
      cidade?: string;
      estado?: string;
    },
    @CurrentUser() user?: any,
  ) {
    return this.analyticsService.track({
      ...body,
      usuarioId: user?.id,
    });
  }

  @Get('acquisition')
  @UseGuards(AuthGuard('jwt'))
  async acquisition(@Query('periodo') periodo?: '7d' | '30d' | '90d') {
    return this.analyticsService.getAcquisition(periodo);
  }

  @Get('activation')
  @UseGuards(AuthGuard('jwt'))
  async activation() {
    return this.analyticsService.getActivation();
  }

  @Get('engagement')
  @UseGuards(AuthGuard('jwt'))
  async engagement() {
    return this.analyticsService.getEngagement();
  }

  @Get('retention')
  @UseGuards(AuthGuard('jwt'))
  async retention() {
    return this.analyticsService.getRetention();
  }

  @Get('funnel')
  @UseGuards(AuthGuard('jwt'))
  async funnel() {
    return this.analyticsService.getFunnel();
  }
}
