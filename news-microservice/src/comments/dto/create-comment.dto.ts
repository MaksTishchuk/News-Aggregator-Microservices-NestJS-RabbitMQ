import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsNumber()
  authorId: number;

  @IsNotEmpty()
  @IsNumber()
  newsId: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsNumber()
  parentCommentId: number;

  @IsOptional()
  @IsNumber()
  replyToUserId: number;

  @IsOptional()
  @IsString()
  replyToUserUsername: string;

  @IsOptional()
  @IsString()
  replyToUserFirstName: string;
}
