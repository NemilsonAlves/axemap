import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { DenunciasController } from './denuncias.controller';
import { AdminModerationController } from './admin-moderation.controller';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [NotificacoesModule],
  controllers: [DenunciasController, AdminModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
