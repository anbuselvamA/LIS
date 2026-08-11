import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check application health status' })
  check() {
    return {
      status: 'ok',
      service: 'Freelancerz Enterprise LIS',
      version: '1.0.0',
    };
  }
}
