import { File } from 'multer'

export interface IUpdateFilesRequestContract {
  newsId: number
  images?: File[]
  videos?: File[]
}
