import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './users.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { DB_CONNECTION_NAME } from 'src/constants';
import { hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { playloadCreateUserInterface } from './interface/payload-create-user.interface';

@Injectable()
export class UsersService {
    @InjectModel(Users.name, DB_CONNECTION_NAME)
    private readonly usersModel: Model<Users>;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    getUserModel(): Model<Users> {
        return this.usersModel;
    }

    async createUser(user: playloadCreateUserInterface): Promise<Users> {
        const hashPassword = await hash(user.password, 10);
        const createUser = new this.usersModel({
            ...user,
            password: hashPassword,
        });
        return this.usersModel.create(createUser);
    }
}
