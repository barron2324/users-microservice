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

@Injectable()
export class AuthService {
  private jwtSecret = this.configService.get<string>(JWTSECRET);
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async findEmailUser(email: string): Promise<Users | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      this.logger.log(`No existe el usuario ${email}`);
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<Users> {
    return await this.usersService.getUserModel().findOne({ email }).lean();
  }

  async createTokens(userId: string, email: string): Promise<any> {
    const jwtOption: JwtSignOptions = {
      secret: this.configService.get<string>('authentication.secret'),
    }
    return Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        jwtOption,
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        jwtOption,
      ),
    ])
  }

  async getByUserId(userId: string): Promise<Users> {
    return this.usersService.getUserModel()
      .findOne(
        { userId },
        {
          _id: 0,
          userId: 1,
          username: 1,
          email: 1,
          roles: 1,
        },
      )
      .lean()
  }

  async getByEmail(email: string): Promise<Users> {
    return this.usersService.getUserModel()
      .findOne({ email }, { _id: 0, createdAt: 0, updatedAt: 0 })
      .lean()
  }
}
