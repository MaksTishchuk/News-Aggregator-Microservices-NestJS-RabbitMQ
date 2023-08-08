import { Injectable } from '@nestjs/common';
import {lastValueFrom} from "rxjs";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {LogsTypeDto} from "./dto/logs-type.dto";

@Injectable()
export class LoggerService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  async findAllLogs(dto: LogsTypeDto) {
    const logsResponse = this.clientLogger.send('get-all-logs', dto)
    return await lastValueFrom(logsResponse)
  }

  async clearLogs(dto: LogsTypeDto) {
    this.clientLogger.emit('clear-logs', dto)
  }
}
