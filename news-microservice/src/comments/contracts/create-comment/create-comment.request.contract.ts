export interface ICreateCommentRequestContract {
  authorId: number
  newsId: number
  text: string
  parentCommentId?: number
  replyToUserId?: number
  replyToUserUsername?: string
  replyToUserFirstName?: string
}