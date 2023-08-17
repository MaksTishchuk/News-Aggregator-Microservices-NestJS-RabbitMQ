import {Controller, Logger} from '@nestjs/common';
import { NewsService } from './news.service';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {AckErrors} from "../common/ack-errors";
import {
  ICreateNewsRequestContract, IDeleteNewsRequestContract, IDeleteNewsResponseContract,
  IFindOneNewsResponseContract, IGetAllNewsRequestContract, IGetAllNewsResponseContract,
  ISearchNewsRequestContract, ISearchNewsResponseContract, IUpdateNewsRequestContract,
  IUpdateNewsResponseContract, IUserSubscriptionNewsRequestContract,
  IUserSubscriptionNewsResponseContract
} from "./contracts";

@Controller()
export class NewsController {
  private logger = new Logger(NewsController.name)

  constructor(private readonly newsService: NewsService) {}

  @EventPattern('create-news')
  async createNews(@Payload() request: ICreateNewsRequestContract, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create news`)
      await this.newsService.createNews(request.newsDto, request.images, request.videos)
      await channel.ack(originalMessage)
      this.logger.log(`CreateNews: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`CreateNews: Acknowledge message success`)
      }
    }
  }

  @MessagePattern('find-all-news')
  async findAllNews(
    @Payload() request: IGetAllNewsRequestContract, @Ctx() context: RmqContext
  ): Promise<IGetAllNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find news`)
      return await this.newsService.findAllNews(request);
    } finally {
      this.logger.log(`FindAllNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('user-subscriptions-news')
  async getUserSubscriptionsNews(
    @Payload() request: IUserSubscriptionNewsRequestContract, @Ctx() context: RmqContext
  ): Promise<IUserSubscriptionNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user subscriptions news`)
      return await this.newsService.getUserSubscriptionsNews(request);
    } finally {
      this.logger.log(`GetUserSubscriptionNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('search-news')
  async searchNews(
    @Payload() request: ISearchNewsRequestContract, @Ctx() context: RmqContext
  ): Promise<ISearchNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to search news`)
      return await this.newsService.searchNews(request);
    } finally {
      this.logger.log(`SearchNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('find-one-news')
  async findOneNews(@Payload() id: number, @Ctx() context: RmqContext): Promise<IFindOneNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to find one news`)
      return await this.newsService.findOneNews(id);
    } finally {
      this.logger.log(`FindOneNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-news')
  async updateNews(
    @Payload() request: IUpdateNewsRequestContract, @Ctx() context: RmqContext
  ): Promise<IUpdateNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update news`)
      return await this.newsService.updateNews(request.newsDto, request.images, request.videos);
    } finally {
      this.logger.log(`UpdateNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('delete-news')
  async deleteNews(
    @Payload() request: IDeleteNewsRequestContract, @Ctx() context: RmqContext
  ): Promise<IDeleteNewsResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete news`)
      return await this.newsService.deleteNews(request);
    } finally {
      this.logger.log(`DeleteNews: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}
