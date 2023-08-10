import {Controller, Logger} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {PaginationDto} from "../common/dto/pagination.dto";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {DeleteCommentDto} from "./dto/delete-comment.dto";

@Controller('comments')
export class CommentsController {
  private logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('create-comment')
  async createComment(@Payload() dto: CreateCommentDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create comment`)
      const comment = await this.commentsService.createComment(dto);
      return comment
    } finally {
      this.logger.log(`CreateComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-all-comments')
  async findAllComments(@Payload() dto: PaginationDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find all comments`)
      const comments = await this.commentsService.findAllComments(dto);
      return comments
    } finally {
      this.logger.log(`FindAllComments: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-news-comments')
  async findNewsComments(@Payload() payload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find news comments`)
      const comments = await this.commentsService.findNewsComments(payload.newsId, payload.dto);
      return comments
    } finally {
      this.logger.log(`FindNewsComments: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-comment-by-id')
  async findCommentById(@Payload() commentId: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find comment by id`)
      const comment = await this.commentsService.findCommentById(commentId);
      return comment
    } finally {
      this.logger.log(`FindCommentById: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-comment')
  async updateComment(@Payload() dto: UpdateCommentDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update comment`)
      const comment = await this.commentsService.updateComment(dto);
      return comment
    } finally {
      this.logger.log(`UpdateComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('delete-comment')
  async deleteComment(@Payload() dto: DeleteCommentDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete comment`)
      const response = await this.commentsService.deleteComment(dto);
      return response
    } finally {
      this.logger.log(`DeleteComment: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}

