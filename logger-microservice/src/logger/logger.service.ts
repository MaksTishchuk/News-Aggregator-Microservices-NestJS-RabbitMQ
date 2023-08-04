import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {LoggerDocument, LoggerModel} from "./models/logger.model";
import {Model} from "mongoose";
import {LoggerDto} from "./dto/logger.dto";
import {LogTypeEnum} from "./models/enums/log-type.enum";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger()

  constructor(@InjectModel(LoggerModel.name) private readonly loggerModel: Model<LoggerDocument>) {}

  async createLog(dto: LoggerDto) {
    await this.loggerModel.create({...dto})
    this.makeLog(dto)
  }

  makeLog(dto: LoggerDto) {
    const additionalInfo = dto.additionalInfo ? `- ${dto.additionalInfo}` :  ''
    switch (dto.type) {
      case LogTypeEnum.action:
        this.logger.log(`${dto.message} ${additionalInfo}`, dto.microservice)
        break
      case LogTypeEnum.error:
        this.logger.error(`${dto.message} ${additionalInfo}`, dto.microservice)
        break
      case LogTypeEnum.warning:
        this.logger.warn(`${dto.message} ${additionalInfo}`, dto.microservice)
        break
      default:
        break
    }
  }
}
