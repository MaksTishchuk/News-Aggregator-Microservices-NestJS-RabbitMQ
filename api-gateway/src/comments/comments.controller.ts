import {
  Body,
  Controller, Get,
  Logger,
  Post, Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";


@Controller('comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createComment(@GetCurrentUserId() id: number, @Body() dto: CreateCommentDto) {
    this.logger.log(`Try to create comment`)
    return await this.commentsService.createComment(id, dto);
  }

  @Get('')
  async findAllComments(@Query() dto: PaginationDto) {
    this.logger.log(`Try to find all comments`)
    return await this.commentsService.findAllComments(dto);
  }
}
