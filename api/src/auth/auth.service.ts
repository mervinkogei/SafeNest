import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const generic = {
      ok: true,
      message: 'If that email is registered, a reset code is ready. For this demo, the code is shown on the next step when the account exists.',
    };
    if (!user) return generic;

    const code = String(randomInt(100000, 999999));
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash: await bcrypt.hash(code, 10),
        resetExpires: new Date(Date.now() + 20 * 60 * 1000),
      },
    });
    return {
      ...generic,
      demoCode: code,
    };
  }

  async resetPassword(email: string, code: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user?.resetCodeHash || !user.resetExpires || user.resetExpires < new Date()) {
      throw new BadRequestException('That reset code is invalid or has expired.');
    }
    const matches = await bcrypt.compare(code.trim(), user.resetCodeHash);
    if (!matches) throw new BadRequestException('That reset code is invalid or has expired.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
        resetCodeHash: null,
        resetExpires: null,
      },
    });
    return { ok: true, message: 'Password updated. You can sign in now.' };
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
    const token = await this.jwt.signAsync({
      sub: userId,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return { token, user };
  }
}
