import {IsArray, IsOptional} from 'class-validator';
import {File} from 'multer'

export class UploadFilesDto {

  @IsOptional()
  @IsArray()
  images: File[] // This will hold image files

  @IsOptional()
  @IsArray()
  videos: File[] // This will hold the video file
}