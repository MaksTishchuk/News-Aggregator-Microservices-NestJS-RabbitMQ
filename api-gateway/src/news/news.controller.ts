import {
  Body,
  Controller, Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query, UploadedFiles,
  UseGuards, UseInterceptors
} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {NewsService} from "./news.service";
import {CreateNewsDto} from "./dto/create-news.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {FileFieldsInterceptor} from "@nestjs/platform-express";

@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(private newsService: NewsService, private clientProxyRMQ: ClientProxyRMQ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 4 }]))
  async createNews(@GetCurrentUserId() id: number, @Body() dto: CreateNewsDto, @UploadedFiles() images) {
    this.logger.log(`Try to create news`)
    return await this.newsService.createNews(id, dto, images);
  }

  @Get('')
  async findAllNews(@Query() dto: PaginationDto) {
    this.logger.log(`Try to find all news`)
    return await this.newsService.findAllNews(dto);
  }

  @Get('user-subscriptions-news')
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptionNews(@GetCurrentUserId() userId: number, @Query() dto: PaginationDto) {
    this.logger.log(`Try to get user subscription news`)
    return await this.newsService.getUserSubscriptionNews(userId, dto);
  }

  @Get('search')
  searchUsers(@Query() dto: SearchNewsDto) {
    this.logger.log(`Try to search news`)
    return this.newsService.searchNews(dto);
  }

  @Get(':id')
  async findOneNews(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Try to find news by id`)
    return await this.newsService.findOneNews(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 4 }]))
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUserId() authorId: number,
    @Body() dto: UpdateNewsDto,
    @UploadedFiles() images
  ) {
    this.logger.log(`Try to update news`)
    return await this.newsService.updateNews(id, authorId, dto, images);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNews(@Param('id', ParseIntPipe) id: number, @GetCurrentUserId() authorId: number) {
    this.logger.log(`Try to delete news`)
    return await this.newsService.deleteNews(id, authorId);
  }
}
