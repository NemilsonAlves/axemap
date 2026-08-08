import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Get('health')
  health() {
    return this.system.health();
  }

  @Get('status')
  status() {
    return this.system.status();
  }

  @Get('version')
  version() {
    return this.system.version();
  }

  @Get('metrics')
  metrics() {
    return this.system.metrics();
  }

  @Get('readiness')
  readiness() {
    return this.system.readiness();
  }

  @Get('liveness')
  liveness() {
    return this.system.liveness();
  }
}
