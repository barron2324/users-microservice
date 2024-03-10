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
        const emailUser = await this.findOneEmail(user.email);
        if (emailUser) {
            throw new UnauthorizedException('Email already exists');
        }
        const usernameUser = await this.findOneUsername(user.username);
        if (usernameUser) {
            throw new UnauthorizedException('Username already exists');
        }
        const hashPassword = await hash(user.password, 10);
        const createUser = new this.usersModel({
            ...user,
            password: hashPassword,
        });
        return this.usersModel.create(createUser);
    }

    async findOneEmail(email: string): Promise<Users> {
        return this.usersModel.findOne({ email }).lean()
    }

    async findOneUsername(username: string): Promise<Users> {
        return this.usersModel.findOne({ username }).lean();
    }

    async deleteOneByUserId(userId: string): Promise<Users> {
        return this.usersModel.findOneAndDelete({ userId }).lean().exec()
    }
}
