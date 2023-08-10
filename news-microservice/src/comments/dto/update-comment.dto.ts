import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsNumber()
  authorId: number;

  @IsNotEmpty()
  @IsNumber()
  commentId: number;

  @IsNotEmpty()
  @IsString()
  text: string;
}
