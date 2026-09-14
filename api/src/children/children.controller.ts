import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ChildrenService } from './children.service';

class CreateChildDto {
  @IsString()
  displayName: string;

  @IsIn(['8-12', '13-15', '16-17'])
  ageRange: string;
}

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
  constructor(private children: ChildrenService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateChildDto) {
    return this.children.create(user, dto.displayName, dto.ageRange);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.children.list(user);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateChildDto) {
    return this.children.update(user, id, dto.displayName, dto.ageRange);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.children.remove(user, id);
  }
}
