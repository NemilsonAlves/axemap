import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect(process.env.FRONTEND_URL || 'http://localhost:3000', 302)
  redirectToFrontend() {}
}
