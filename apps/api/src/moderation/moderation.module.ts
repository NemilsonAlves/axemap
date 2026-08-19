import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModerationService } from './moderation.service';
import { DenunciasController } from './denuncias.controller';
import { AdminModerationController } from './admin-moderation.controller';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [
    NotificacoesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [DenunciasController, AdminModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}