import {
  Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {ICommentWithAuthor} from "./interfaces/comment-with-author.interface";
import {IDeleteCommentResponseContract} from "./contracts";


@Controller('comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @GetCurrentUserId() id: number, @Body() dto: CreateCommentDto
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`User with id "${id}" try to create comment`)
    return await this.commentsService.createComment(id, dto);
  }

  @Get('')
  async findAllComments(@Query() dto: PaginationDto): Promise<ICommentWithAuthor[]> {
    this.logger.log(`Try to find all comments`)
    return await this.commentsService.findAllComments(dto);
  }

  @Get('for-news')
  async findNewsComments(
    @Query() dto: PaginationDto, @Body('newsId', ParseIntPipe) newsId: number
  ): Promise<ICommentWithAuthor[]> {
    this.logger.log(`Try to find comments for news with id "${newsId}"`)
    return await this.commentsService.findNewsComments(newsId, dto);
  }

  @Get(':commentId')
  async findCommentById(
    @Param('commentId', ParseIntPipe) commentId: number
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`Try to find comment by id "${commentId}"`)
    return await this.commentsService.findCommentById(commentId);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetCurrentUserId() authorId: number,
    @Body() dto: UpdateCommentDto
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`User with id "${authorId}" try to update comment with id "${commentId}"`)
    return await this.commentsService.updateComment(commentId, authorId, dto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetCurrentUserId() authorId: number
  ): Promise<IDeleteCommentResponseContract> {
    this.logger.log(`User with id "${authorId}" try to delete comment with id "${commentId}"`)
    return await this.commentsService.deleteComment(commentId, authorId);
  }
}
