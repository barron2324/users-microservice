import { Controller, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { playloadCreateUserInterface } from './interface/payload-create-user.interface';
import { AuthService } from '../auth/auth.service';
import { USER_CMD } from 'src/constants';
import { payloadLoginUserInterface } from '../auth/interface/payload-login-user.interface';
import { loginterface } from '../auth/interface/login.interface';
import { Users } from './users.schema';

@Controller('users')
export class UsersMicroserviec {
    private readonly logger = new Logger();
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @MessagePattern({
        cmd: USER_CMD,
        method: 'login',
    })
    async signIn(
        @Payload() payload: { userId: string; email: string },
    ): Promise<loginterface> {
        const { userId, email } = payload

        let jwtSign: loginterface
        try {
            jwtSign = await this.authService.createTokens(userId, email)
        } catch (e) {
            this.logger.error(
                `catch on login-createTokens: ${e?.message ?? JSON.stringify(e)}`,
            )
            throw new InternalServerErrorException({
                message: e?.message ?? e,
            })
        }

        const update = {
            $set: {
                token: jwtSign[0],
                latestLogin: Date.now(),
            },
        }

        try {
            await this.usersService.getUserModel().updateOne({ email }, update)
        } catch (e) {
            this.logger.error(
                `catch on login-update: ${e?.message ?? JSON.stringify(e)}`,
            )
            throw new InternalServerErrorException({
                message: e?.message ?? e,
            })
        }
        return {
            accessToken: jwtSign[0],
            refreshToken: jwtSign[1],
        }
    }
    @MessagePattern({
        cmd: USER_CMD,
        method: 'register',
    })
    async register(
        @Payload() payload: playloadCreateUserInterface,
    ): Promise<void> {
        try {
            await this.usersService.createUser(payload);
            this.logger.log(`Create Success : ${payload.email, payload.username}`)
        } catch (error) {
            this.logger.error(
                `catch on createUser: ${error?.message ?? JSON.stringify(error)}`,
            )
            throw new InternalServerErrorException({
                message: error?.message ?? error,
            })
        }
    }

    @MessagePattern({
        cmd: USER_CMD,
        method: 'getByUserId',
    })
    async getByUserId(@Payload() userId: string): Promise<Users> {
        try {
            return this.authService.getByUserId(userId)
        } catch (error) {
            this.logger.error(
                `catch on getByObjectId: ${error?.message ?? JSON.stringify(error)}`,
            )
            throw new InternalServerErrorException({
                message: error?.message ?? error,
            })
        }
    }

    @MessagePattern({
        cmd: USER_CMD,
        method: 'getByEmail',
    })
    async getByEmail(@Payload() email: string): Promise<Users> {
        try {
            return this.authService.getByUserId(email)
        } catch (error) {
            this.logger.error(
                `catch on getByObjectId: ${error?.message ?? JSON.stringify(error)}`,
            )
            throw new InternalServerErrorException({
                message: error?.message ?? error,
            })
        }
    }

    @MessagePattern({
        cmd: USER_CMD,
        method: 'ping',
    })
    async pong() {
        const pong = 'Pong!';
        this.logger.log(pong);
    }
}