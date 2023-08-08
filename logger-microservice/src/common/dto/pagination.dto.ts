import {IsNumber, IsOptional, IsPositive} from 'class-validator';
import {Type} from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({allowNaN: false, allowInfinity: false})
  @IsPositive()
  page: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({allowNaN: false, allowInfinity: false})
  @IsPositive()
  perPage: number
}
