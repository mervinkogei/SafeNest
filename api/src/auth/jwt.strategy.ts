import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  role?: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'safenest-hackathon-demo-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException('Please sign in again.');

    let user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user && payload.email) {
      user = await this.prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    }
    if (!user && payload.email && payload.role) {
      user = await this.prisma.user.create({
        data: {
          id: payload.sub,
          email: payload.email.toLowerCase(),
          name: payload.name || payload.email,
          role: payload.role,
          passwordHash: 'jwt-restored',
        },
      });
    }
    if (!user) throw new UnauthorizedException('Please sign in again.');
    return user;
  }
}
