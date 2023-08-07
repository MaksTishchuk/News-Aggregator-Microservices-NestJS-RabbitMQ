import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception.status) {
      status = exception.status
    }

    const message = exception instanceof HttpException ? exception.getResponse() : exception;

    this.logger.error(`Http Status: ${status}. Error message: ${JSON.stringify(message)}`);

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        message: message.message ? message.message : message,
        name: message.name,
        status,
      },
    });
  }
}