import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('riskType') riskType?: string) {
    return this.prisma.resource.findMany({
      where: riskType ? { riskTypes: { contains: riskType } } : undefined,
      orderBy: [{ emergency: 'desc' }, { name: 'asc' }],
    });
  }
}
