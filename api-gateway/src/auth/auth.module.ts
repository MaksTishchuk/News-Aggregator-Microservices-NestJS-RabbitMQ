import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [ProxyRmqModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
