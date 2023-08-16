import {
  IsEnum,
  IsNotEmpty, IsOptional
} from 'class-validator';
import {PaginationDto} from "../../common/dto/pagination.dto";
import {LogTypeEnum} from "../../common/enums/log-type.enum";

export class LogsTypeDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LogTypeEnum)
  @IsNotEmpty()
  type: LogTypeEnum
}
