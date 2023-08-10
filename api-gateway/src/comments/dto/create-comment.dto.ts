import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import {Transform} from "class-transformer";

export class CreateCommentDto {

  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  newsId: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  parentCommentId: number;

  @IsOptional()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  replyToUserId: number;

  @IsOptional()
  @IsString()
  replyToUserUsername: string;

  @IsOptional()
  @IsString()
  replyToUserFirstName: string;
}
