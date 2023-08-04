import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  RequestTimeoutException
} from '@nestjs/common';
import {catchError, Observable, throwError, timeout, TimeoutError} from 'rxjs';
import {ClientProxyRMQ} from "../../proxy-rmq/client-proxy-rmq";
import {LoggerDto} from "../dto/logger.dto";
import {LogTypeEnum} from "../enums/log-type.enum";
import {MicroservicesEnum} from "../enums/microservices.enum";
import {ConfigService} from "@nestjs/config";

export class TimeoutInterceptor implements NestInterceptor {
  private clientLogger = new ClientProxyRMQ(new ConfigService()).getClientProxyLoggerInstance()

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const url = context.getArgs()[0].url
    const method = context.getArgs()[0].method
    return next.handle().pipe(
      timeout(10000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          const payload: LoggerDto = {
            type: LogTypeEnum.error,
            microservice: MicroservicesEnum.apiGateway,
            message: `[Timeout Error] url: ${url}, method: ${method}`,
            additionalInfo: `${err}`
          }
          this.clientLogger.emit('create-log', payload)
          return throwError(() => new RequestTimeoutException());
        }
        const payload: LoggerDto = {
            type: LogTypeEnum.error,
            microservice: MicroservicesEnum.apiGateway,
            message: `[Error] url: ${url}, method: ${method}`,
            additionalInfo: `${err}`
          }
          this.clientLogger.emit('create-log', payload)
        return throwError(() => new Error());
      })
    )
  }
}