import {ICommentWithAuthor, IRepliesWithAuthor} from "../interfaces/comment-with-author.interface";
import {IAuthorEntityShort} from "../../news/interfaces/author-entity-short.interface";

export class CommentEntityWithAuthor implements ICommentWithAuthor {
  id: number
  text: string
  authorId: number
  newsId: number
  parentCommentId: number | null
  replyToUserId: number | null
  replyToUserUsername: string | null
  replyToUserFirstName: string | null
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  repliesCount: number
  replies: RepliesEntity[]
  author: AuthorEntityShort
}

class AuthorEntityShort implements IAuthorEntityShort {
  id: number
  email: string
  username: string
  avatar: string
  firstName: string
  lastName: string
  subscribersCount: number
  subscriptionsCount: number
}

class RepliesEntity implements IRepliesWithAuthor {
  id: number
  text: string
  authorId: number
  newsId: number
  parentCommentId: number | null
  replyToUserId: number | null
  replyToUserUsername: string | null
  replyToUserFirstName: string | null
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  repliesCount: number
  author: AuthorEntityShort;
}
