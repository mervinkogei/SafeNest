import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      ok: true,
      product: 'SafeNest API',
      health: '/api/health',
    };
  }

  @Get('health')
  health() {
    return { ok: true, product: 'SafeNest' };
  }
}
