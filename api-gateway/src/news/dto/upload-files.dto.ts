import {IsArray, IsOptional} from 'class-validator';
import {File} from 'multer'
import {ApiPropertyOptional} from "@nestjs/swagger";

export class UploadFilesDto {

  @ApiPropertyOptional({ type: [File], format: 'binary' })
  @IsOptional()
  @IsArray()
  images: File[] // This will hold image files

  @ApiPropertyOptional({ type: [File], format: 'binary' })
  @IsOptional()
  @IsArray()
  videos: File[] // This will hold the video file
}