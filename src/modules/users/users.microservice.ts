import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { playloadCreateUserInterface } from './interface/payload-create-user.interface';
import { AuthService } from '../auth/auth.service';
import { USER_CMD } from 'src/constants';

@Controller('users')
export class UsersMicroserviec {
    private readonly logger = new Logger();
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @MessagePattern({
        cmd: USER_CMD,
        method: 'register',
    })
    async register(
        @Payload() payload: playloadCreateUserInterface,
    ): Promise<void> {
        try {
            await this.usersService.createUser(payload);
            this.logger.log('Created User')
        } catch (error) {
            this.logger.error(`Error create user: ${error}`);
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