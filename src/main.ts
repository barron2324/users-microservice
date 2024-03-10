import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import * as dayjs from 'dayjs';
import 'dayjs/plugin/timezone';
import 'dayjs/plugin/isToday';

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isToday'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('PORT');
  const provider = configService.get<string>('PROVIDER');
  const rmqUrl = configService.get('RMQ_URL');
  const logger = new Logger();

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl]
    }
  })

  app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`
      Application ${provider} started listen on port ${port}
      Local Timezone guess: ${dayjs.tz.guess()}
      Local Date: ${dayjs().toDate().toISOString()} ~ ${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )}
    `);
  });
}
bootstrap();
