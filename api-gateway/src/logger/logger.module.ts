import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [ProxyRmqModule],
  controllers: [LoggerController],
  providers: [LoggerService]
})
export class LoggerModule {}
