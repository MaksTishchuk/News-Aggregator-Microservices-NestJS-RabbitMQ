import {IsNotEmpty, IsOptional, IsString} from 'class-validator';
import { File } from 'multer'
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class CreateNewsDto {

  @ApiProperty({
    description: 'News title',
    example: 'This is news title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'News body',
    example: 'This is news body with text',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ type: [File], format: 'binary' })
  @IsOptional()
  images?: File[];

  @ApiPropertyOptional({ type: [File], format: 'binary' })
  @IsOptional()
  video?: File[];
}
