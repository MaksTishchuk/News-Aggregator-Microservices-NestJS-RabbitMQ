import {IAuthorEntityShort} from "../../news/interfaces/author-entity-short.interface";
import {ICommentEntity} from "./comment-entity.interface";

export interface ICommentWithAuthor extends ICommentEntity {
  replies: IRepliesWithAuthor[]
  author: IAuthorEntityShort
}

export interface IRepliesWithAuthor extends ICommentEntity {
  author: IAuthorEntityShort
}
