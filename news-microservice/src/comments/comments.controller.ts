import {Controller, Logger} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {PaginationDto} from "../common/dto/pagination.dto";
import {CreateCommentDto} from "./dto/create-comment.dto";

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
      this.logger.log(`Try to find comments`)
      const comments = await this.commentsService.findAllComments();
      return comments
    } finally {
      this.logger.log(`FindAllComments: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}

