import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [ProxyRmqModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
