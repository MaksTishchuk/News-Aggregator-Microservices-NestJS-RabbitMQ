import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {PaginationDto} from "../../common/dto/pagination.dto";

export class SearchNewsDto extends PaginationDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  body?: string;
}
