import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import {ConfigModule} from "@nestjs/config";
import { ProxyRmqModule } from './proxy-rmq/proxy-rmq.module';
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    NewsModule,
    ProxyRmqModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
