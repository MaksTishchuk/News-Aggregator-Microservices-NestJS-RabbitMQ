import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {AllExceptionsFilter} from "./common/exceptions/exception.filter";
import {TimeoutInterceptor} from "./common/interceptors/timeout.interceptor";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService>(ConfigService)
  app.setGlobalPrefix('api/v1')
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TimeoutInterceptor())

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('News Aggregator')
    .setDescription('News Aggregator API documentation')
    .setVersion('1.0')
    .addTag('News Aggregator')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document)

  const PORT = configService.get<number>('PORT', 4000)
  await app.listen(PORT, () =>
    Logger.log(`Application API-Gateway has been started on PORT: ${PORT}`, 'Main')
  )
}

bootstrap();
