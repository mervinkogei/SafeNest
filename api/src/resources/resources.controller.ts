import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('resources')
export class ResourcesController {
  constructor(private prisma: PrismaService) {}

  @Get('public')
  publicList() {
    return this.prisma.resource.findMany({
      where: { emergency: true, country: 'Kenya' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        phone: true,
        emergency: true,
        country: true,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Query('riskType') riskType?: string) {
    return this.prisma.resource.findMany({
      where: riskType ? { riskTypes: { contains: riskType } } : undefined,
      orderBy: [{ emergency: 'desc' }, { name: 'asc' }],
    });
  }
}
