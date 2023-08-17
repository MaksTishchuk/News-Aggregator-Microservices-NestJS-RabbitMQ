import {
  Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, Put, Query,
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

@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name)

  constructor(private newsService: NewsService) {}

  @Post('')
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

  @Get('')
  async findAllNews(@Query() dto: PaginationDto): Promise<INewsWithAuthorFiles[]> {
    this.logger.log(`Try to find all news`)
    return await this.newsService.findAllNews(dto);
  }

  @Get('user-subscriptions-news')
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptionNews(
    @GetCurrentUserId() userId: number, @Query() dto: PaginationDto
  ): Promise<INewsWithAuthorFiles[]> {
    this.logger.log(`Try to get user subscription news`)
    return await this.newsService.getUserSubscriptionNews(userId, dto);
  }

  @Get('search')
  searchUsers(@Query() dto: SearchNewsDto): Promise<SearchNewsInterface> {
    this.logger.log(`Try to search news`)
    return this.newsService.searchNews(dto);
  }

  @Get(':id')
  async findOneNews(@Param('id', ParseIntPipe) id: number): Promise<INewsWithAuthorFiles> {
    this.logger.log(`Try to find news by id`)
    return await this.newsService.findOneNews(id);
  }

  @Put(':id')
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
  ): Promise<INewsWithAuthorFiles> {
    this.logger.log(`Try to update news`)
    return await this.newsService.updateNews(id, authorId, dto, files.images, files.videos);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNews(
    @Param('id', ParseIntPipe) id: number, @GetCurrentUserId() authorId: number
  ): Promise<IDeleteNewsResponseContract> {
    this.logger.log(`Try to delete news`)
    return await this.newsService.deleteNews(id, authorId);
  }
}
