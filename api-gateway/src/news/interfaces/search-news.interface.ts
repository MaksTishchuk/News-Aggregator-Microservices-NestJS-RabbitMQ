import {INewsWithAuthorFiles} from "./news-with-author-files";

export interface SearchNewsInterface {
  news: INewsWithAuthorFiles[],
  total: number
}