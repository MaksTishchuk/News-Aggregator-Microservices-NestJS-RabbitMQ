import {
  IsEnum,
  IsNotEmpty, IsOptional,
  IsString,
} from 'class-validator';
import {LogTypeEnum} from "../enums/log-type.enum";
import {MicroservicesEnum} from "../enums/microservices.enum";

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
  additionalInfo: string
}
