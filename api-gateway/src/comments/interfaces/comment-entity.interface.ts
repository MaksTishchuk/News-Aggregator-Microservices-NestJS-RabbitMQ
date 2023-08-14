export interface ICommentEntity {
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
}