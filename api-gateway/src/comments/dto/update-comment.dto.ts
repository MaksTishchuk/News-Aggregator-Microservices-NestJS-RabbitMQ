import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
