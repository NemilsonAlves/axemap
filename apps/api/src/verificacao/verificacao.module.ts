import { Module } from '@nestjs/common';
import { VerificacaoController } from './verificacao.controller';
import { VerificacaoService } from './verificacao.service';
import { UploadModule } from '../upload/upload.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [UploadModule, NotificacoesModule, AuditLogsModule],
  controllers: [VerificacaoController],
  providers: [VerificacaoService],
  exports: [VerificacaoService],
})
export class VerificacaoModule {}
