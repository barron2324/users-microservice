import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from 'src/config/configuration';
import { DB_CONNECTION_NAME } from 'src/constants';
import { UsersModule } from '../users/users.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        MongooseModule.forRootAsync({
            connectionName: DB_CONNECTION_NAME,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                return {
                    uri: configService.get<string>('database.host'),
                    ...configService.get<any>('database.options'),
                };
            },
            inject: [ConfigService],
        }),
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}