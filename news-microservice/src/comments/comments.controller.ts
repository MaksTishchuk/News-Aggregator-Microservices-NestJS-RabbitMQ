import {Controller, Logger} from '@nestjs/common';
import {CommentsService} from './comments.service';
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {
  ICreateCommentRequestContract, ICreateCommentResponseContract, IDeleteCommentRequestContract,
  IDeleteCommentResponseContract, IFindAllCommentsRequestContract, IFindAllCommentsResponseContract,
  IFindCommentByIdResponseContract, IFindNewsCommentsRequestContract, IFindNewsCommentsResponseContract,
  IUpdateCommentRequestContract, IUpdateCommentResponseContract
} from "./contracts";

@Controller('comments')
export class CommentsController {
  private logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('create-comment')
  async createComment(
    @Payload() payload: ICreateCommentRequestContract, @Ctx() context: RmqContext
  ): Promise<ICreateCommentResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create comment`)
      return await this.commentsService.createComment(payload)
    } finally {
      this.logger.log(`CreateComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-all-comments')
  async findAllComments(
    @Payload() payload: IFindAllCommentsRequestContract, @Ctx() context: RmqContext
  ): Promise<IFindAllCommentsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find all comments`)
      return await this.commentsService.findAllComments(payload)
    } finally {
      this.logger.log(`FindAllComments: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-news-comments')
  async findNewsComments(
    @Payload() payload: IFindNewsCommentsRequestContract, @Ctx() context: RmqContext
  ): Promise<IFindNewsCommentsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find news comments`)
      return await this.commentsService.findNewsComments(payload.newsId, payload.dto)
    } finally {
      this.logger.log(`FindNewsComments: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-comment-by-id')
  async findCommentById(
    @Payload() commentId: number, @Ctx() context: RmqContext
  ): Promise<IFindCommentByIdResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find comment by id`)
      return await this.commentsService.findCommentById(commentId)
    } finally {
      this.logger.log(`FindCommentById: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-comment')
  async updateComment(
    @Payload() data: IUpdateCommentRequestContract, @Ctx() context: RmqContext
  ): Promise<IUpdateCommentResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update comment`)
      return await this.commentsService.updateComment(data)
    } finally {
      this.logger.log(`UpdateComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('delete-comment')
  async deleteComment(
    @Payload() data: IDeleteCommentRequestContract, @Ctx() context: RmqContext
  ): Promise<IDeleteCommentResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete comment`)
      return await this.commentsService.deleteComment(data)
    } finally {
      this.logger.log(`DeleteComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}

