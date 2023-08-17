import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import { File } from 'multer'

export class CreateNewsDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  images?: File[];

  @IsOptional()
  video?: File;
}
