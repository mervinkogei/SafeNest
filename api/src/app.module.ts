import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ResourcesModule } from './resources/resources.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ChildrenModule,
    IncidentsModule,
    ResourcesModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
