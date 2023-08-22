import {IsNumber} from 'class-validator';

export class DeleteNewsDto {
  @IsNumber()
  id: number;

  @IsNumber()
  authorId: number;
}
