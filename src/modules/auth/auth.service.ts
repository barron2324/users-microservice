import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Users } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interface/payload-jwt.interface';
import { JWTSECRET } from 'src/constants';
import { compare } from 'bcrypt';
import StatusUser from '../users/enum/status-user.enum';
import RoleUser from '../users/enum/roles-user.enum';

@Injectable()
export class AuthService {
  private jwtSecret = this.configService.get<string>(JWTSECRET);
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  async createTokens(email: string): Promise<any> {
    const jwtOption: JwtSignOptions = {
      expiresIn: '2day',
      secret: this.configService.get<string>('authentication.secret'),
    }
    return Promise.all([
      this.jwtService.signAsync(
        {
          email,
        },
        jwtOption,
      ),
      this.jwtService.signAsync(
        {
          email,
        },
        jwtOption,
      ),
    ])
  }

  getByUserId(userId: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ userId }).lean()
  }

  getByEmail(email: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ email }).lean()
  }

  getByUsername(username: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ username }).lean()
  }

  blockUser(email: string): Promise<Users> {
    return this.usersService.getUserModel().findOne(
      {
        email,
        status: StatusUser.INACTIVE
      }
    ).lean()
  }
}
