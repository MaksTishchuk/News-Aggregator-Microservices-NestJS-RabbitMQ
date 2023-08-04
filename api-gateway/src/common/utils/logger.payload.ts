import {LogTypeEnum} from "../enums/log-type.enum";
import {MicroservicesEnum} from "../enums/microservices.enum";
import {LoggerDto} from "../dto/logger.dto";

export const makeLoggerPayload = (action: LogTypeEnum, message: string, additionalInfo: string=''): LoggerDto => {
  return {
      type: action,
      microservice: MicroservicesEnum.apiGateway,
      message: message,
      additionalInfo: ''
    }
}