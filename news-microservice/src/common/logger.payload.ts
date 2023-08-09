import {LogTypeEnum} from "./enums/log-type.enum";
import {LoggerDto} from "./dto/logger.dto";
import {MicroservicesEnum} from "./enums/microservices.enum";

export const makeLoggerPayload = (action: LogTypeEnum, message: string, additionalInfo: string=''): LoggerDto => {
  return {
      type: action,
      microservice: MicroservicesEnum.news,
      message: message,
      additionalInfo: additionalInfo ? additionalInfo : ''
    }
}