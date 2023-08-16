import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {LoggerDocument, LoggerModel} from "./models/logger.model";
import {Model} from "mongoose";
import {LoggerDto} from "./dto/logger.dto";
import {LogTypeEnum} from "./models/enums/log-type.enum";
import {getPagination} from "../common/pagination";
import {LogsTypeDto} from "./dto/logs-type.dto";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger()

  constructor(@InjectModel(LoggerModel.name) private readonly loggerModel: Model<LoggerDocument>) {}

  async createLog(dto: LoggerDto): Promise<void> {
    await this.loggerModel.create({...dto, createdAt: Date.now()})
    this.makeLog(dto)
  }

  async getAllLogs(dto: LogsTypeDto): Promise<LoggerModel[]> {
    const {perPage, skip} = getPagination(dto)
    let filter = {}
    if (dto.type) filter = {type: dto.type}
    return this.loggerModel.find(filter)
      .sort({createdAt: 'desc'})
      .select('-__v')
      .limit(perPage)
      .skip(skip);
  }

  async clearLogs(dto: LogsTypeDto): Promise<void> {
    let filter = {}
    let info = ''
    if (dto.type) {
      filter = {type: dto.type}
      info = ` Type to delete: ${dto.type}!`
    }
    await this.loggerModel.deleteMany(filter).then(() => {
      this.logger.log(`Logs successfully cleared!${info}`, LoggerService.name)
    }).catch((error) => {
      this.logger.error(error)
    })
  }

  makeLog(dto: LoggerDto): void {
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
