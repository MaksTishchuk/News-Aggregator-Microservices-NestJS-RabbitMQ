export interface INewsEntity {
  id: number
  authorId: number
  title: string
  body: string
  isImages: boolean
  views: number
  createdAt: Date
  updatedAt: Date
  commentsCount: number
}
