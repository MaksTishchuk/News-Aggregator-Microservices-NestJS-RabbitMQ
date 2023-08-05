import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsDto } from './create-news.dto';
import {IsNumber} from "class-validator";

export class UpdateNewsDto extends PartialType(CreateNewsDto) {
  @IsNumber()
  id: number;
}
