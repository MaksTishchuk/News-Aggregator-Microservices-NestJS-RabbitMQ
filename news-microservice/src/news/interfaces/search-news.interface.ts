import {INewsWithAuthorImages} from "./news-with-author-images";

export interface SearchNewsInterface {
  news: INewsWithAuthorImages[],
  total: number
}