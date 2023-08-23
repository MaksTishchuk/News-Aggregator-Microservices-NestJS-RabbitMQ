import {
  Body, Controller, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {ICommentWithAuthor} from "./interfaces/comment-with-author.interface";
import {IDeleteCommentResponseContract} from "./contracts";
import {
  ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiOperation, ApiSecurity, ApiTags
} from "@nestjs/swagger";
import {SuccessResponseDto} from "../common/swagger-response/success-response.dto";
import {CommentEntityWithAuthor} from "./swagger-response/comment-entity-with-author.dto";
import {ExceptionResponseDto} from "../common/swagger-response/exception-response.dto";

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name)

  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ description: 'Create comment' })
  @ApiCreatedResponse({
    type: CommentEntityWithAuthor,
    description: 'Comment has been created'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'News with id "${id}" was not found!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Something went wrong!'
  })
  @ApiSecurity('bearer')
  @Post('')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @GetCurrentUserId() id: number, @Body() dto: CreateCommentDto
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`User with id "${id}" try to create comment`)
    return await this.commentsService.createComment(id, dto);
  }

  @ApiOperation({ description: 'Get all comments' })
  @ApiOkResponse({
    type: [CommentEntityWithAuthor],
    description: 'Got all comments with paginate'
  })
  @Get('')
  @HttpCode(200)
  async findAllComments(@Query() dto: PaginationDto): Promise<ICommentWithAuthor[]> {
    this.logger.log(`Try to find all comments`)
    return await this.commentsService.findAllComments(dto);
  }

  @ApiOperation({ description: 'Get comments for news' })
  @ApiOkResponse({
    type: [CommentEntityWithAuthor],
    description: 'Got comments for news with paginate'
  })
  @Get('for-news')
  @HttpCode(200)
  async findNewsComments(
    @Query() dto: PaginationDto, @Body('newsId', ParseIntPipe) newsId: number
  ): Promise<ICommentWithAuthor[]> {
    this.logger.log(`Try to find comments for news with id "${newsId}"`)
    return await this.commentsService.findNewsComments(newsId, dto);
  }

  @ApiOperation({ description: 'Get comment by id' })
  @ApiOkResponse({
    type: CommentEntityWithAuthor,
    description: 'Got comment by id'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'Comment with id "${id}" was not found!'
  })
  @Get(':commentId')
  @HttpCode(200)
  async findCommentById(
    @Param('commentId', ParseIntPipe) commentId: number
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`Try to find comment by id "${commentId}"`)
    return await this.commentsService.findCommentById(commentId);
  }

  @ApiOperation({ description: 'Update comment' })
  @ApiOkResponse({
    type: CommentEntityWithAuthor,
    description: 'Updated comment by id'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Comment with id "${id}" has not been updated! or Comment with id "${id}" has not been updated! Access denied!'
  })
  @ApiSecurity('bearer')
  @Put(':commentId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetCurrentUserId() authorId: number,
    @Body() dto: UpdateCommentDto
  ): Promise<ICommentWithAuthor> {
    this.logger.log(`User with id "${authorId}" try to update comment with id "${commentId}"`)
    return await this.commentsService.updateComment(commentId, authorId, dto);
  }

  @ApiOperation({ description: 'Delete comment' })
  @ApiOkResponse({
    type: SuccessResponseDto,
    description: 'Comment has been deleted!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'Comment with id "${id}" has not been deleted!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Comment with id "${id}" has not been deleted! Access denied!'
  })
  @ApiSecurity('bearer')
  @Delete(':commentId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetCurrentUserId() authorId: number
  ): Promise<IDeleteCommentResponseContract> {
    this.logger.log(`User with id "${authorId}" try to delete comment with id "${commentId}"`)
    return await this.commentsService.deleteComment(commentId, authorId);
  }
}
