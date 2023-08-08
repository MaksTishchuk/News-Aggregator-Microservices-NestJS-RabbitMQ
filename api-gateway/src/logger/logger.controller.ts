import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AdminRoleGuard} from "../user/guards/admin-role.guard";
import {LogsTypeDto} from "./dto/logs-type.dto";
import {LoggerDto} from "../common/dto/logger.dto";
import {makeLoggerPayload} from "../common/utils/logger.payload";
import {LogTypeEnum} from "../common/enums/log-type.enum";

@Controller('logs')
export class LoggerController {

  private readonly logger = new Logger(LoggerController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(private readonly logsService: LoggerService, private clientProxyRMQ: ClientProxyRMQ) {}

  @Get('')
  @UseGuards(JwtAuthGuard, )
  async findAllLogs(@Query() dto: LogsTypeDto) {
    this.logger.log(`Try to find all logs`)
    return await this.logsService.findAllLogs(dto);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard,)
  async clearLogs(@Query() dto: LogsTypeDto) {
    this.logger.log(`Try to clear logs`)
    const payload: LoggerDto = makeLoggerPayload(LogTypeEnum.action, `Try to clear logs`)
    this.clientLogger.emit('create-log', payload)
    await this.logsService.clearLogs(dto);
  }
}
