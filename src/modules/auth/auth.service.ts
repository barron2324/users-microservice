import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interface/payload-jwt.interface';
import { LoginResponse } from './entities/login-response.dto';
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

  async validatePassword(
    password: string,
    userPasswordHash: string,
  ): Promise<boolean> {
    return await compare(password, userPasswordHash);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.findEmailUser(email);
    if (!user) {
      return null;
    }
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = {
      email: user.email,
      sub: user.userId,
    };
    return {
      messages: 'User logged in successfully.',
      user: user.email,
      accessToken: this.jwtService.sign(payload, { secret: this.jwtSecret }),
    };
  }
}
