import {
  IsEnum,
  IsNotEmpty, IsOptional,
  IsString,
} from 'class-validator';
import {LogTypeEnum} from "../models/enums/log-type.enum";
import {MicroservicesEnum} from "../models/enums/microservices.enum";

export class LoggerDto {
  @IsEnum(LogTypeEnum)
  @IsNotEmpty()
  type: LogTypeEnum

  @IsEnum(MicroservicesEnum)
  @IsNotEmpty()
  microservice: MicroservicesEnum

  @IsString()
  @IsNotEmpty()
  message: string

  @IsOptional()
  @IsString()
  additionalInfo: string
}
