import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error, user: TUser) {
    if (err) throw err;
    if (!user) throw new UnauthorizedException('Please sign in again.');
    return user;
  }
}
