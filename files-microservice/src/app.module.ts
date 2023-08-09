import * as path from 'path'
import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import {getMongoConfig} from "./config/mongo.config";
import {ServeStaticModule} from "@nestjs/serve-static";
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/images',
      rootPath: path.resolve(__dirname, 'uploads'),
    }),
    FilesModule,
  ]
})
export class AppModule {}
