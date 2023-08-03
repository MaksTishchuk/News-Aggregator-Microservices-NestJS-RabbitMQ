import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {LoggerModel, LoggerModelSchema} from "./models/logger.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: LoggerModel.name, schema: LoggerModelSchema}
    ])
  ],
  controllers: [LoggerController],
  providers: [LoggerService]
})
export class LoggerModule {}
