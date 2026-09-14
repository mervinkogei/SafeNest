import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  @Patch(':id/read')
  read(@CurrentUser() user: User, @Param('id') id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true },
    });
  }
}
