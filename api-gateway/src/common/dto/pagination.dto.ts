import {IsNumber, IsOptional, IsPositive} from 'class-validator';
import {Type} from "class-transformer";
import {ApiPropertyOptional} from "@nestjs/swagger";

export class PaginationDto {

  @ApiPropertyOptional({
    description: 'Number of page',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({allowNaN: false, allowInfinity: false})
  @IsPositive()
  page: number

  @ApiPropertyOptional({
    description: 'Number of news by page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({allowNaN: false, allowInfinity: false})
  @IsPositive()
  perPage: number
}
