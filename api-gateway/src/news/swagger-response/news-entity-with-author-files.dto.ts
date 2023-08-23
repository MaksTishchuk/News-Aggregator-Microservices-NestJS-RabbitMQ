import {INewsWithAuthorFiles} from "../interfaces/news-with-author-files";
import {IAuthorEntityShort} from "../interfaces/author-entity-short.interface";

export class NewsEntityWithAuthorFilesDto implements INewsWithAuthorFiles {
  id: number
  authorId: number
  title: string
  body: string
  isImages: boolean
  isVideos: boolean
  views: number
  createdAt: Date
  updatedAt: Date
  commentsCount: number
  author: AuthorEntityShort
  images: string[]
  videos: string[]
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