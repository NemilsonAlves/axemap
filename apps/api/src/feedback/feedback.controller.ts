import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from './feedback.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  async criar(@Body() body: { tipo: string; mensagem: string; pagina?: string; contato?: string }, @CurrentUser() user?: any) {
    return this.feedbackService.criar(body, user?.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listar(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.feedbackService.listar(limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
  }
}
