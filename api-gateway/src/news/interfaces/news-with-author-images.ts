import { File } from 'multer'
import {INewsWithAuthor} from "./news-with-author.interface";

export interface INewsWithAuthorImages extends INewsWithAuthor {
  images: File[]
}
