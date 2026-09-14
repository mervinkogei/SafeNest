import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async create(guardian: User, displayName: string, ageRange: string) {
    if (guardian.role !== 'PARENT') {
      throw new ForbiddenException('Only a parent or caregiver can add a child profile.');
    }
    return this.prisma.child.create({
      data: {
        guardianId: guardian.id,
        displayName: displayName.trim(),
        ageRange,
        inviteCode: randomBytes(3).toString('hex').toUpperCase(),
      },
    });
  }

  async list(user: User) {
    if (user.role === 'PARENT') {
      return this.prisma.child.findMany({
        where: { guardianId: user.id },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.child.findMany({
      where: { userId: user.id },
      include: { guardian: { select: { id: true, name: true } } },
    });
  }

  async getLinkedChild(user: User) {
    if (user.role === 'CHILD') {
      const child = await this.prisma.child.findUnique({ where: { userId: user.id } });
      if (!child) throw new NotFoundException('This account is not linked to a family profile yet.');
      return child;
    }
    return null;
  }
}
