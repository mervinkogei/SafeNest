import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('An account with that email already exists.');

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
        role: dto.role,
      },
    });

    if (dto.role === 'CHILD' && dto.inviteCode) {
      const child = await this.prisma.child.findUnique({ where: { inviteCode: dto.inviteCode.trim().toUpperCase() } });
      if (child && !child.userId) {
        await this.prisma.child.update({
          where: { id: child.id },
          data: { userId: user.id },
        });
      }
    }

    return this.issue(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is not correct.');
    }
    return this.issue(user.id);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        children: true,
        childProfile: { include: { guardian: true } },
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async issue(userId: string) {
    const user = await this.me(userId);
    const token = await this.jwt.signAsync({ sub: userId, role: user.role });
    return { token, user };
  }
}
