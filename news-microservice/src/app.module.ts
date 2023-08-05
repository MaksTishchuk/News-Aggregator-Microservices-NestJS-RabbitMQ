import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {getTypeOrmConfig} from "./config/typeorm.config";
import { ProxyRmqModule } from './proxy-rmq/proxy-rmq.module';
import { NewsModule } from './news/news.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig
    }),
    ProxyRmqModule,
    NewsModule,
    CommentsModule,
  ]
})
export class AppModule {}
