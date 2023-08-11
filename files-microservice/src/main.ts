import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import {Logger, ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get<string>('RMQ_USER')}:${configService.get<string>('RMQ_PASSWORD')}@${configService.get<string>('RMQ_URL')}`,
      ],
      queue: 'files',
      noAck: false,
      queueOptions: {
        durable: true
      }
    }
  })
  app.useGlobalPipes(new ValidationPipe())
  await app.startAllMicroservices()
  const PORT = configService.get<number>('PORT', 4001)
  await app.listen(PORT, () =>
    Logger.log(`Application Files-Microservice has been started on PORT: ${PORT}`, 'Main')
  )
}

bootstrap();
