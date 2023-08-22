import {
  Controller,
  Delete,
  Get,
  Logger,
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
import {IGetAllLogsResponseContract} from "./contracts";
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {LogsEntityDto} from "./swagger-response/log-entity.dto";
import {ExceptionResponseDto} from "../common/swagger-response/exception-response.dto";

@ApiTags('Logs')
@Controller('logs')
export class LoggerController {

  private readonly logger = new Logger(LoggerController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(private readonly logsService: LoggerService, private clientProxyRMQ: ClientProxyRMQ) {}

  @ApiOperation({ description: 'Get all logs or logs by type' })
  @ApiOkResponse({
    type: [LogsEntityDto],
    description: 'Get all logs or logs by type'
  })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: 'User without Admin role can`t make this request!'
  })
  @ApiSecurity('bearer')
  @Get('')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async findAllLogs(@Query() dto: LogsTypeDto): Promise<IGetAllLogsResponseContract> {
    this.logger.log(`Try to find all logs`)
    return await this.logsService.findAllLogs(dto);
  }

  @ApiOperation({ description: 'Clear logs' })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: 'User without Admin role can`t make this request!'
  })
  @ApiSecurity('bearer')
  @Delete('clear')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async clearLogs(@Query() dto: LogsTypeDto): Promise<void> {
    this.logger.log(`Try to clear logs`)
    const payload: LoggerDto = makeLoggerPayload(LogTypeEnum.action, `Try to clear logs`)
    this.clientLogger.emit('create-log', payload)
    await this.logsService.clearLogs(dto);
  }
}
