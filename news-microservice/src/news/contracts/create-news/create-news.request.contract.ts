import { File } from 'multer'

export interface ICreateNewsRequestContract {
  newsDto: {
    authorId: number
    title: string
    body: string
  }
  images: File[]
}
