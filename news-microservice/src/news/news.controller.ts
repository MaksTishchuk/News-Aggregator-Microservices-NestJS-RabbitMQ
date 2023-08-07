import {Controller, Logger} from '@nestjs/common';
import { NewsService } from './news.service';
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {CreateNewsDto} from "./dto/create-news.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {DeleteNewsDto} from "./dto/delete-news.dto";

@Controller()
export class NewsController {
  private logger = new Logger(NewsController.name)

  constructor(private readonly newsService: NewsService) {}

  @MessagePattern('create-news')
  async createNews(@Payload() dto: CreateNewsDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create news`)
      const news = await this.newsService.createNews(dto);
      return news
    } finally {
      this.logger.log(`CreateNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-all-news')
  async findAllNews(@Payload() dto: PaginationDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find news`)
      const news = await this.newsService.findAllNews(dto);
      return news
    } finally {
      this.logger.log(`GetAllNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('user-subscriptions-news')
  async getUserSubscriptionsNews(@Payload() payload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user subscriptions news`)
      const news = await this.newsService.getUserSubscriptionsNews(payload);
      return news
    } finally {
      this.logger.log(`GetUserSubscriptionNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('search-news')
  async searchNews(@Payload() dto: SearchNewsDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to search news`)
      const news = await this.newsService.searchNews(dto);
      return news
    } finally {
      this.logger.log(`SearchNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-one-news')
  async findOneNews(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find one news`)
      const user = await this.newsService.findOneNews(id);
      return user;
    } finally {
      this.logger.log(`FindOneNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-news')
  async updateNews(@Payload() dto: UpdateNewsDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update news`)
      const news = await this.newsService.updateNews(dto);
      return news
    } finally {
      this.logger.log(`UpdateNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('delete-news')
  async deleteNews(@Payload() dto: DeleteNewsDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete news`)
      const news = await this.newsService.deleteNews(dto);
      return news
    } finally {
      this.logger.log(`DeleteNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}
