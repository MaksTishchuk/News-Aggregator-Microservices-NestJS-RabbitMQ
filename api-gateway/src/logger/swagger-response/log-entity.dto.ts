import {ILoggerEntity} from "../interfaces/ILoggerEntity";
import {LogTypeEnum} from "../../common/enums/log-type.enum";

export class LogsEntityDto implements ILoggerEntity {
  _id: string
  type: LogTypeEnum
  microservice: string
  message: string
  additionalInfo: string
  createdAt: Date
  updatedAt: Date
}