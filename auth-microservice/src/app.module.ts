import * as path from 'path'
import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {getTypeOrmConfig} from "./config/typeorm.config";
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import { ProxyRmqModule } from './proxy-rmq/proxy-rmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/images',
      rootPath: path.resolve(__dirname, 'uploads'),
    }),
    AuthModule,
    UserModule,
    ProxyRmqModule,
  ]
})
export class AppModule {}
