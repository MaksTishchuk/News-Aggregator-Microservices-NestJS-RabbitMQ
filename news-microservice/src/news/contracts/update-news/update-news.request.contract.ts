import { File } from 'multer'

export interface IUpdateNewsRequestContract {
  newsDto: {
    id: number
    authorId: number
    title?: string;
    body?: string
  }
  images: File[] | undefined
}
