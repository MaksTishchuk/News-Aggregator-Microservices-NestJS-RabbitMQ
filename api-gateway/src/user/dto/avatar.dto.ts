import {ApiProperty} from "@nestjs/swagger";
import {File} from 'multer'

export class AvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: File
}
