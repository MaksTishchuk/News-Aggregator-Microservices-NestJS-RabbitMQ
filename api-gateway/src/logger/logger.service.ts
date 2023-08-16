import { Injectable } from '@nestjs/common';
import {lastValueFrom} from "rxjs";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {LogsTypeDto} from "./dto/logs-type.dto";
import {
  IClearLogsRequestContract, IGetAllLogsRequestContract, IGetAllLogsResponseContract
} from "./contracts";

@Injectable()
export class LoggerService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  async findAllLogs(dto: LogsTypeDto): Promise<IGetAllLogsResponseContract> {
    const payload: IGetAllLogsRequestContract = {...dto}
    const logsResponse = this.clientLogger.send('get-all-logs', payload)
    return await lastValueFrom(logsResponse)
  }

  async clearLogs(dto: LogsTypeDto): Promise<void> {
    const payload: IClearLogsRequestContract = {...dto}
    this.clientLogger.emit('clear-logs', payload)
  }
}
