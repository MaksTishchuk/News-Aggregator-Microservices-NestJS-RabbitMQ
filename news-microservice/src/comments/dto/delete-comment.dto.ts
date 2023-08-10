import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class DeleteCommentDto {
  @IsNumber()
  commentId: number;

  @IsNumber()
  authorId: number;
}
