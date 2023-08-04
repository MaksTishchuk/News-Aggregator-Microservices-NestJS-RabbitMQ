import { Module } from '@nestjs/common';
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getJwtConfig} from "../config/jwt.config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {UserModule} from "../user/user.module";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    ProxyRmqModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
