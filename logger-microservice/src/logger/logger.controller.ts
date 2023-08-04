import {Controller, Logger} from '@nestjs/common';
import { LoggerService } from './logger.service';
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {LoggerDto} from "./dto/logger.dto";
import {AckErrors} from "../../utils/ack-errors";

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
}
