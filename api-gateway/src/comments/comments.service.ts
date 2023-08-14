import {Injectable} from '@nestjs/common';
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {
  ICreateCommentRequestContract, ICreateCommentResponseContract, IDeleteCommentRequestContract,
  IDeleteCommentResponseContract, IFindAllCommentsRequestContract, IFindAllCommentsResponseContract,
  IFindCommentByIdResponseContract, IFindNewsCommentsRequestContract, IFindNewsCommentsResponseContract,
  IUpdateCommentRequestContract, IUpdateCommentResponseContract
} from "./contracts";
import {ICommentWithAuthor, IRepliesWithAuthor} from "./interfaces/comment-with-author.interface";
import {IGetUsersByIdsResponseContract} from "../news/contracts";
import {ICommentEntityWithReplies} from "./interfaces/comment-entity-with-replies.interface";
import {IAuthorEntityShort} from "../news/interfaces/author-entity-short.interface";

@Injectable()
export class CommentsService {

  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientComments = this.clientProxyRMQ.getClientProxyNewsInstance()
  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async createComment(authorId: number, dto: CreateCommentDto): Promise<ICommentWithAuthor> {
    const payload: ICreateCommentRequestContract = {authorId, ...dto}
    const commentResponse = this.clientComments.send('create-comment', payload)
    let comment: ICreateCommentResponseContract = await lastValueFrom(commentResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async findAllComments(dto: PaginationDto): Promise<ICommentWithAuthor[]> {
    const payload: IFindAllCommentsRequestContract = {...dto}
    const commentsResponse = this.clientComments.send('find-all-comments', payload)
    let comments: IFindAllCommentsResponseContract = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentsAndTheirReplies(comments)
  }

  async findNewsComments(newsId: number, dto: PaginationDto): Promise<ICommentWithAuthor[]> {
    const payload: IFindNewsCommentsRequestContract = {newsId, dto: {...dto}}
    const commentsResponse = this.clientComments.send('find-news-comments', payload)
    let comments: IFindNewsCommentsResponseContract = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentsAndTheirReplies(comments)
  }

  async findCommentById(commentId: number): Promise<ICommentWithAuthor> {
    const commentResponse = this.clientComments.send('find-comment-by-id', commentId)
    let comment: IFindCommentByIdResponseContract = await lastValueFrom(commentResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async updateComment(commentId: number, authorId: number, dto: UpdateCommentDto): Promise<ICommentWithAuthor> {
    const payload: IUpdateCommentRequestContract = {commentId, authorId, ...dto}
    const commentsResponse = this.clientComments.send('update-comment', payload)
    let comment: IUpdateCommentResponseContract = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async deleteComment(commentId: number, authorId: number): Promise<IDeleteCommentResponseContract> {
    const payload: IDeleteCommentRequestContract = {commentId, authorId}
    const commentsResponse = this.clientComments.send('delete-comment', payload)
    return await lastValueFrom(commentsResponse)
  }

  private async addAuthorToCommentAndReplies(comment: ICommentEntityWithReplies): Promise<ICommentWithAuthor> {
    let usersIds: number[] = []
    if (comment.replies && comment.replies.length > 0) {
      usersIds = comment.replies.map((reply) => reply.authorId)
    }
    usersIds.push(comment.authorId)
    usersIds = Array.from(new Set(usersIds))
    const authorResponse = this.clientAuth.send('get-users-by-ids', usersIds)
    const authors: IGetUsersByIdsResponseContract = await lastValueFrom(authorResponse)
    const author: IAuthorEntityShort = authors.find((author) => author.id === comment.authorId)
    let replies: IRepliesWithAuthor[] = []
    if (comment.replies && comment.replies.length > 0) {
      replies = comment.replies.map((reply) => {
        const author = authors.find((author) => author.id === reply.authorId);
        return {...reply, author}
      })
    }
    return {...comment, replies, author}
  }

  private async addAuthorToCommentsAndTheirReplies(comments: ICommentEntityWithReplies[]): Promise<ICommentWithAuthor[]> {
    let usersIds: number[] = []
    comments.forEach(comment => {
      usersIds.push(comment.authorId)
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => usersIds.push(reply.authorId))
      }
    })
    usersIds = Array.from(new Set(usersIds))
    const authorResponse = this.clientAuth.send('get-users-by-ids', usersIds)
    const authors: IGetUsersByIdsResponseContract = await lastValueFrom(authorResponse)
    return comments.map((comment) => {
      const author: IAuthorEntityShort = authors.find((author) => author.id === comment.authorId)
      const commentWithAuthor = {...comment, author}
      let replies: IRepliesWithAuthor[] = []
      if (commentWithAuthor.replies && commentWithAuthor.replies.length > 0) {
        replies = commentWithAuthor.replies.map((reply) => {
          const author = authors.find((author) => author.id === reply.authorId)
          return {...reply, author}
        })
      }
      return {...commentWithAuthor, replies}
    })
  }
}
