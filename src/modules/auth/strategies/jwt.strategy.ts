import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Users } from 'src/modules/users/users.schema';
import { JwtPayload } from '../interface/payload-jwt.interface';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('authentication.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<Users> {
    const user = await this.authService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
    return user;
  }
}
