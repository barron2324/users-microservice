import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DB_CONNECTION_NAME, jwtConstants } from 'src/constants';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { model } from 'src/config/model';

@Module({
  imports: [
    MongooseModule.forFeature(model, DB_CONNECTION_NAME),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [],
  providers: [
    AuthService,
    JwtService,
    UsersService,
    ConfigService,
  ],
})
export class AuthModule {}
