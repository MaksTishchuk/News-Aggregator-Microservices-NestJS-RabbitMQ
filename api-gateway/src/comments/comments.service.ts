import { Injectable } from '@nestjs/common';
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {UpdateCommentDto} from "./dto/update-comment.dto";

@Injectable()
export class CommentsService {

  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientComments = this.clientProxyRMQ.getClientProxyNewsInstance()
  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async createComment(authorId: number, dto: CreateCommentDto) {
    const commentResponse = this.clientComments.send('create-comment', {authorId, ...dto})
    let comment = await lastValueFrom(commentResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async findAllComments(dto: PaginationDto) {
    const commentsResponse = this.clientComments.send('find-all-comments', dto)
    let comments = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentsAndTheirReplies(comments)
  }

  async findNewsComments(newsId: number, dto: PaginationDto) {
    const commentsResponse = this.clientComments.send('find-news-comments', {newsId, dto: {...dto}})
    let comments = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentsAndTheirReplies(comments)
  }

  async findCommentById(commentId: number) {
    const commentResponse = this.clientComments.send('find-comment-by-id', commentId)
    let comment = await lastValueFrom(commentResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async updateComment(commentId: number, authorId: number, dto: UpdateCommentDto) {
    const commentsResponse = this.clientComments.send('update-comment', {commentId, authorId, ...dto})
    let comment = await lastValueFrom(commentsResponse)
    return await this.addAuthorToCommentAndReplies(comment)
  }

  async deleteComment(commentId: number, authorId: number) {
    const commentsResponse = this.clientComments.send('delete-comment', {commentId, authorId})
    return await lastValueFrom(commentsResponse)
  }

  private async addAuthorToCommentAndReplies(comment) {
    let usersIds = []
    if (comment.replies && comment.replies.length > 0) {
      usersIds = comment.replies.map((reply) => reply.authorId)
    }
    usersIds.push(comment.authorId)
    usersIds = Array.from(new Set(usersIds))
    const authorResponse = this.clientAuth.send('get-users-by-ids', usersIds)
    const authors = await lastValueFrom(authorResponse)
    comment.author = authors.find((author) => author.id === comment.authorId)
    if (comment.replies && comment.replies.length > 0) {
      comment.replies = comment.replies.map((reply) => {
        const author = authors.find((author) => author.id === reply.authorId);
        if (author) reply.author = author
        return reply;
      })
    }
    return comment
  }

  private async addAuthorToCommentsAndTheirReplies(comments) {
    let usersIds = []
    comments.forEach(comment => {
      usersIds.push(comment.authorId)
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => usersIds.push(reply.authorId))
      }
    })
    usersIds = Array.from(new Set(usersIds))
    const authorResponse = this.clientAuth.send('get-users-by-ids', usersIds)
    const authors = await lastValueFrom(authorResponse)
    return comments.map((comment) => {
      const author = authors.find((author) => author.id === comment.authorId)
      if (author) comment.author = author
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = comment.replies.map((reply) => {
          const author = authors.find((author) => author.id === reply.authorId)
          if (author) reply.author = author
          return reply
        })
      }
      return comment
    })
  }
}
