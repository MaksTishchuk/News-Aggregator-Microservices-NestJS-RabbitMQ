import {IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import {Transform} from "class-transformer";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class CreateCommentDto {

  @ApiProperty({
    description: 'News id for comment',
    example: 10,
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  newsId: number;

  @ApiProperty({
    description: 'Comment text',
    example: 'This is comment text',
  })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'If user answer on parent comment, sent the parent comment id',
    example: 25,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  parentCommentId: number;

  @ApiPropertyOptional({
    description: 'If user answer on parent comment, sent the parent comment user id',
    example: 25,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  replyToUserId: number;

  @ApiPropertyOptional({
    description: 'If user answer on parent comment, sent the parent comment username',
    example: 'user999',
  })
  @IsOptional()
  @IsString()
  replyToUserUsername: string;

  @ApiPropertyOptional({
    description: 'If user answer on parent comment, sent the parent comment first name',
    example: 'Maksym',
  })
  @IsOptional()
  @IsString()
  replyToUserFirstName: string;
}
