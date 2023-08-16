import {LogTypeEnum} from "../../common/enums/log-type.enum";

export interface ILoggerEntity {
  _id: string
  type: LogTypeEnum
  microservice: string
  message: string
  additionalInfo: string
  createdAt: Date
  updatedAt: Date
}
