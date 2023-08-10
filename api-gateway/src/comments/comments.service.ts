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

  async createComment(authorId: number, dto: CreateCommentDto) {
    const commentResponse = this.clientComments.send('create-comment', {authorId, ...dto})
    return await lastValueFrom(commentResponse)
  }

  async findAllComments(dto: PaginationDto) {
    const commentsResponse = this.clientComments.send('find-all-comments', dto)
    return await lastValueFrom(commentsResponse)
  }

  async findNewsComments(newsId: number, dto: PaginationDto) {
    const commentsResponse = this.clientComments.send('find-news-comments', {newsId, dto: {...dto}})
    return await lastValueFrom(commentsResponse)
  }

  async findCommentById(commentId: number) {
    const commentsResponse = this.clientComments.send('find-comment-by-id', commentId)
    return await lastValueFrom(commentsResponse)
  }

  async updateComment(commentId: number, authorId: number, dto: UpdateCommentDto) {
    const commentsResponse = this.clientComments.send('update-comment', {commentId, authorId, ...dto})
    return await lastValueFrom(commentsResponse)
  }

  async deleteComment(commentId: number, authorId: number) {
    const commentsResponse = this.clientComments.send('delete-comment', {commentId, authorId})
    return await lastValueFrom(commentsResponse)
  }
}
