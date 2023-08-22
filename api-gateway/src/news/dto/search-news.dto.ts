import { IsOptional } from 'class-validator';
import {PaginationDto} from "../../common/dto/pagination.dto";
import {ApiPropertyOptional} from "@nestjs/swagger";

export class SearchNewsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'News title',
    example: 'This is news title',
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'News body',
    example: 'This is news body with text',
  })
  @IsOptional()
  body?: string;
}
