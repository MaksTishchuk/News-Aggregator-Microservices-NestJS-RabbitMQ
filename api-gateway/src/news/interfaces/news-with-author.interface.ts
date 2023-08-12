import {INewsEntity} from "./news-entity.interface";
import {IAuthorEntityShort} from "./author-entity-short.interface";

export interface INewsWithAuthor extends INewsEntity {
  author: IAuthorEntityShort
}
