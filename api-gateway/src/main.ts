import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  const PORT = configService.get<number>('PORT', 4000)
  await app.listen(PORT, () =>
    Logger.log(`Application API-Gateway has been started on PORT: ${PORT}`, 'Main')
  )
}

bootstrap();
