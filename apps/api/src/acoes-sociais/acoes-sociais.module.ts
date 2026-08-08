import { Module } from '@nestjs/common';
import { AcoesSociaisController } from './acoes-sociais.controller';
import { AcoesSociaisService } from './acoes-sociais.service';

@Module({
  controllers: [AcoesSociaisController],
  providers: [AcoesSociaisService],
  exports: [AcoesSociaisService],
})
export class AcoesSociaisModule {}
