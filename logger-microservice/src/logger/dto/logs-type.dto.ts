import {
  IsEnum,
  IsNotEmpty, IsOptional
} from 'class-validator';
import {LogTypeEnum} from "../models/enums/log-type.enum";
import {PaginationDto} from "../../common/dto/pagination.dto";

export class LogsTypeDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LogTypeEnum)
  @IsNotEmpty()
  type: LogTypeEnum
}
