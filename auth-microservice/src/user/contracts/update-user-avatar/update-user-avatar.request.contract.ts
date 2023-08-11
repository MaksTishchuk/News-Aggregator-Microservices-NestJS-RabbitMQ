import { File } from 'multer'

export interface IUpdateUserAvatarRequestContract {
  id: number
  avatar: File
}
