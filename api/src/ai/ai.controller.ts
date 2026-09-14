import { Body, Controller, Post } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AiService } from './ai.service';

class GuideDto {
  @IsString()
  @MinLength(2)
  @MaxLength(800)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;
}

@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('guide')
  guide(@Body() dto: GuideDto) {
    return this.ai.guide(dto.message, dto.context);
  }
}
