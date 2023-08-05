import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  images?: any;
}
