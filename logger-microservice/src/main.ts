import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get<string>('RMQ_USER')}:${configService.get<string>('RMQ_PASSWORD')}@${configService.get<string>('RMQ_URL')}`,
      ],
      queue: 'logger',
      noAck: false,
      queueOptions: {
        durable: true
      }
    }
  })
  app.useGlobalPipes(new ValidationPipe())
  await app.startAllMicroservices()
}
bootstrap();
