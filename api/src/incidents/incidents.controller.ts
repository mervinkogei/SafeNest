import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { IncidentsService } from './incidents.service';

class CreateIncidentDto {
  @IsOptional()
  @IsString()
  childId?: string;

  @IsOptional()
  @IsString()
  childName?: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use a valid date.' })
  occurredOn?: string;
}

class EvidenceNoteDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use a valid date.' })
  occurredOn?: string;
}

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private incidents: IncidentsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: User) {
    return this.incidents.dashboard(user);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateIncidentDto) {
    return this.incidents.create(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.incidents.list(user);
  }

  @Get(':id/summary')
  summary(@CurrentUser() user: User, @Param('id') id: string) {
    return this.incidents.summary(user, id);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.incidents.get(user, id);
  }

  @Post(':id/evidence')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }))
  addEvidence(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: EvidenceNoteDto,
  ) {
    return this.incidents.addEvidence(user, id, files || [], dto.note, dto.platform, dto.occurredOn);
  }

  @Get(':id/evidence/:filename')
  async file(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    await this.incidents.get(user, id);
    const buffer = this.incidents.decryptFile(filename);
    const evidence = await this.incidents.fileMeta(id, filename);
    res.setHeader('Content-Type', evidence?.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace('.enc', '')}"`);
    res.send(buffer);
  }

  @Post(':id/analyze')
  analyze(@CurrentUser() user: User, @Param('id') id: string) {
    return this.incidents.analyze(user, id);
  }

  @Get(':id/action-plan')
  actionPlan(@CurrentUser() user: User, @Param('id') id: string) {
    return this.incidents.actionPlan(user, id);
  }

  @Delete(':id/evidence/:evidenceId')
  removeEvidence(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('evidenceId') evidenceId: string,
  ) {
    return this.incidents.removeEvidence(user, id, evidenceId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.incidents.remove(user, id);
  }
}
