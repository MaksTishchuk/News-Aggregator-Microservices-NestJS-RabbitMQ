import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class UpdateNewsDto {
  @ApiProperty({
    description: 'News title',
    example: 'This is news title',
  })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'News body',
    example: 'This is news body with text',
  })
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({ type: ['string'], format: 'binary' })
  @IsOptional()
  images?: File[];

  @ApiPropertyOptional({ type: ['string'], format: 'binary' })
  @IsOptional()
  videos?: File[];
}
