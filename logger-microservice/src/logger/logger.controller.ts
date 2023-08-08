import {Controller, Logger} from '@nestjs/common';
import { LoggerService } from './logger.service';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {LoggerDto} from "./dto/logger.dto";
import {AckErrors} from "../common/ack-errors";
import {LogsTypeDto} from "./dto/logs-type.dto";


@Controller()
export class LoggerController {
  private logger = new Logger(LoggerController.name)

  constructor(private readonly loggerService: LoggerService) {}

  @EventPattern('create-log')
  async makeLog(@Payload() dto: LoggerDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      await this.loggerService.createLog(dto)
      await channel.ack(originalMessage)
    } catch (error) {
      this.logger.error(`Error: ${JSON.stringify(error)}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
      }
    }
  }

  @MessagePattern('get-all-logs')
  async getAllLogs(@Payload() dto: LogsTypeDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get all logs`)
      const logs = await this.loggerService.getAllLogs(dto);
      return logs
    } finally {
      this.logger.log(`GetAllLogs: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('clear-logs')
  async clearLogs(@Payload() dto: LogsTypeDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      await this.loggerService.clearLogs(dto)
      await channel.ack(originalMessage)
      this.logger.log(`ClearLogs: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${JSON.stringify(error)}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`ClearLogs: Acknowledge message success`)
      }
    }
  }
}
