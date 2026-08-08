import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModerationService } from './moderation.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('denuncias')
export class DenunciasController {
  constructor(private moderationService: ModerationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async denunciar(@CurrentUser() user: any, @Body() dto: any) {
    return this.moderationService.denunciar(user.id, dto);
  }
}
