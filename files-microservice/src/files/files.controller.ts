import {Controller, Logger} from '@nestjs/common';
import { FilesService } from './files.service';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {AckErrors} from "../common/ack-errors";

@Controller('files')
export class FilesController {
  private logger = new Logger(FilesController.name)

  constructor(private readonly filesService: FilesService) {}

  @EventPattern('create-images')
  async createImages(@Payload() payload: {newsId: number, images: []}, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create images`)
      await this.filesService.createImages(payload.newsId, payload.images)
      await channel.ack(originalMessage)
      this.logger.log(`CreateImages: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${JSON.stringify(error)}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`CreateImages: Acknowledge message success`)
      }
    }
  }

  @MessagePattern('get-images-by-news-id')
  async getImagesUrls(@Payload() newsId: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get images urls`)
      const imagesUrls = await this.filesService.getImagesUrls(newsId);
      return imagesUrls;
    } finally {
      this.logger.log(`GetImagesUrls: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-images-by-news-ids-list')
  async getImagesListByNewsIds(@Payload() newsIdsList: [], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get images list by ids`)
      const imagesList = await this.filesService.getImagesListByNewsIds(newsIdsList);
      return imagesList;
    } finally {
      this.logger.log(`GetImagesList: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-images')
  async updateNewsImages(@Payload() payload: {newsId: number, images: []}, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update news images urls`)
      const response = await this.filesService.updateNewsImages(payload.newsId, payload.images)
      return response;
    } finally {
      this.logger.log(`UpdateNewsImages: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('delete-images')
  async deleteImages(@Payload() newsId, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete images`)
      await this.filesService.deleteImages(newsId)
      await channel.ack(originalMessage)
      this.logger.log(`DeleteImages: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${JSON.stringify(error)}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`DeleteImages: Acknowledge message success`)
      }
    }
  }
}
