import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateNewsDto {
  @IsNumber()
  authorId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  images?: any;
}
