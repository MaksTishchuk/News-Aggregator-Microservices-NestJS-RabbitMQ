import {
  IsEnum,
  IsNotEmpty, IsOptional
} from 'class-validator';
import {PaginationDto} from "../../common/dto/pagination.dto";
import {LogTypeEnum} from "../../common/enums/log-type.enum";
import {ApiPropertyOptional} from "@nestjs/swagger";

export class LogsTypeDto extends PaginationDto {

  @ApiPropertyOptional({
    description: 'Logs Type - Action, Error, Warning',
    example: 'Action',
  })
  @IsOptional()
  @IsEnum(LogTypeEnum)
  @IsNotEmpty()
  type: LogTypeEnum
}
