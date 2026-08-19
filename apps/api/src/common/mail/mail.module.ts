import { Global, Module } from '@nestjs/common';
import { ConsoleMailProvider, HttpMailProvider, MailService } from './mail.service';

@Global()
@Module({
  providers: [ConsoleMailProvider, HttpMailProvider, MailService],
  exports: [MailService],
})
export class MailModule {}