import {INewsWithAuthor} from "./news-with-author.interface";

export interface INewsWithAuthorFiles extends INewsWithAuthor {
  images: string[]
  videos: string[]
}
