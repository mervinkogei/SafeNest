import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { ChildrenService } from '../children/children.service';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, PrismaService, AiService, ChildrenService],
})
export class IncidentsModule {}
