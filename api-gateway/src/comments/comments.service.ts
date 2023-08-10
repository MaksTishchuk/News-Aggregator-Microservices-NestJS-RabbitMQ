import { Injectable } from '@nestjs/common';
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";

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
}
