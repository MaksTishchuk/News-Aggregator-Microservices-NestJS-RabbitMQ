import {
  Body, Controller, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Post, Put, Query, Res,
  UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {NewsService} from "./news.service";
import {CreateNewsDto} from "./dto/create-news.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {INewsWithAuthorFiles} from "./interfaces/news-with-author-files";
import {SearchNewsInterface} from "./interfaces/search-news.interface";
import {IDeleteNewsResponseContract} from "./contracts";
import {ImagesInterceptor} from "../common/interceptors/images.interceptor";
import {UploadFilesDto} from "./dto/upload-files.dto";
import {VideosInterceptor} from "../common/interceptors/videos.interceptor";
import {Response} from "express";
import {ConfigService} from "@nestjs/config";
import {
  ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags
} from "@nestjs/swagger";
import {NewsEntityWithAuthorFilesDto} from "./swagger-response/news-entity-with-author-files.dto";
import {SuccessResponseDto} from "../common/swagger-response/success-response.dto";
import {SearchNewsSwaggerDto} from "./swagger-response/search-news.dto";
import {ExceptionResponseDto} from "../common/swagger-response/exception-response.dto";

@ApiTags('News')
@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name)

  constructor(private newsService: NewsService, private configService: ConfigService) {}

  @ApiOperation({ description: 'Create news' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: SuccessResponseDto,
    description: 'The news has been sent for processing and will be available soon'
  })
  @ApiSecurity('bearer')
  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 4},
      { name: 'videos', maxCount: 1}
    ]),
    ImagesInterceptor,
    VideosInterceptor
  )
  async createNews(
    @GetCurrentUserId() authorId: number,
    @Body() dto: CreateNewsDto,
    @UploadedFiles() files: UploadFilesDto
  ): Promise<{ success: boolean, message: string }> {
    this.logger.log(`Try to create news`)
    return await this.newsService.createNews(authorId, dto, files.images, files.videos);
  }

  @ApiOperation({ description: 'Get all news' })
  @ApiOkResponse({
    type: [NewsEntityWithAuthorFilesDto],
    description: 'Get all news'
  })
  @Get('')
  @HttpCode(200)
  async findAllNews(@Query() dto: PaginationDto): Promise<INewsWithAuthorFiles[]> {
    this.logger.log(`Try to find all news`)
    return await this.newsService.findAllNews(dto);
  }

  @ApiOperation({ description: 'Get user subscriptions news' })
  @ApiOkResponse({
    type: [NewsEntityWithAuthorFilesDto],
    description: 'Get user subscriptions news'
  })
  @ApiSecurity('bearer')
  @Get('user-subscriptions-news')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptionNews(
    @GetCurrentUserId() userId: number, @Query() dto: PaginationDto
  ): Promise<INewsWithAuthorFiles[]> {
    this.logger.log(`Try to get user subscription news`)
    return await this.newsService.getUserSubscriptionNews(userId, dto);
  }

  @ApiOperation({ description: 'Search news by title or body' })
  @ApiOkResponse({
    type: SearchNewsSwaggerDto,
    description: 'Get news by search title or body'
  })
  @Get('search')
  @HttpCode(200)
  searchUsers(@Query() dto: SearchNewsDto): Promise<SearchNewsInterface> {
    this.logger.log(`Try to search news`)
    return this.newsService.searchNews(dto);
  }

  @ApiOperation({ description: 'You will be redirect to file microservice for streaming video' })
  @ApiQuery({
    name: 'videoName',
    required: true,
    type: String
  })
  @ApiOkResponse({
    description: 'You will be redirect to file microservice for streaming video!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'No video with the same url'
  })
  @Get('stream-video')
  @HttpCode(200)
  async streamVideo(@Res() res: Response, @Query() query) {
    this.logger.log(`Try to stream video with name ${query.videoName}`)
    const url = `${this.configService.get('FILES_SERVER_URL')}/files/stream-video?videoName=${query.videoName}`
    return res.redirect(url)
  }

  @ApiOperation({ description: 'Get news by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of news that exists in the database',
    type: Number
  })
  @ApiOkResponse({
    type: NewsEntityWithAuthorFilesDto,
    description: 'Got news by id'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'News with id "${id}" was not found!'
  })
  @Get(':id')
  @HttpCode(200)
  async findOneNews(@Param('id', ParseIntPipe) id: number): Promise<INewsWithAuthorFiles> {
    this.logger.log(`Try to find news by id`)
    return await this.newsService.findOneNews(id);
  }

  @ApiOperation({ description: 'Update news' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: SuccessResponseDto,
    description: 'The news has been sent for processing and will be available soon'
  })
  @ApiSecurity('bearer')
  @Put(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 4 },
      { name: 'videos', maxCount: 1}
    ]),
    ImagesInterceptor,
    VideosInterceptor
  )
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() authorId: number,
    @Body() dto: UpdateNewsDto,
    @UploadedFiles() files: UploadFilesDto
  ): Promise<{ success: boolean, message: string }> {
    this.logger.log(`Try to update news`)
    return await this.newsService.updateNews(id, authorId, dto, files.images, files.videos);
  }

  @ApiOperation({ description: 'Update news' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of news that exists in the database',
    type: Number
  })
  @ApiOkResponse({
    type: SuccessResponseDto,
    description: 'News has been deleted!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'News with id "${id}" was not found!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'News with id "${id}" was not deleted! Access denied!'
  })
  @ApiSecurity('bearer')
  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async deleteNews(
    @Param('id', ParseIntPipe) id: number, @GetCurrentUserId() authorId: number
  ): Promise<IDeleteNewsResponseContract> {
    this.logger.log(`Try to delete news`)
    return await this.newsService.deleteNews(id, authorId);
  }
}
