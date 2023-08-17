import { File } from 'multer'

export interface ICreateFilesRequestContract {
  newsId: number
  images?: File[]
  videos?: File[]
}
