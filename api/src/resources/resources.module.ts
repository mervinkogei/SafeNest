import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResourcesController } from './resources.controller';

@Module({
  controllers: [ResourcesController],
  providers: [PrismaService],
})
export class ResourcesModule {}
