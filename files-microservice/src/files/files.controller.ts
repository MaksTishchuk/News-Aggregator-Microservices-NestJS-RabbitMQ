import {Controller, Logger} from '@nestjs/common';
import {FilesService} from './files.service';
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {AckErrors} from "../common/ack-errors";
import {
  ICreateFilesRequestContract, IGetFilesByNewsIdResponseContract,
  IGetFilesByNewsIdsListResponseContract, IUpdateFilesRequestContract
} from "./contracts";


@Controller('files')
export class FilesController {
  private logger = new Logger(FilesController.name)

  constructor(private readonly filesService: FilesService) {}

  @EventPattern('create-files')
  async createFiles(
    @Payload() payload: ICreateFilesRequestContract, @Ctx() context: RmqContext
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to create files`)
      await this.filesService.createFiles(payload.newsId, payload.images, payload.videos)
      await channel.ack(originalMessage)
      this.logger.log(`CreateFiles: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`CreateFiles: Acknowledge message success`)
      }
    }
  }

  @MessagePattern('get-files-by-news-id')
  async getFilesUrls(
    @Payload() newsId: number, @Ctx() context: RmqContext
  ): Promise<IGetFilesByNewsIdResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get files urls`)
      return await this.filesService.getFilesUrls(newsId);
    } finally {
      this.logger.log(`GetFilesUrls: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-files-by-news-ids-list')
  async getFilesListByNewsIds(
    @Payload() newsIdsList: [], @Ctx() context: RmqContext
  ): Promise<IGetFilesByNewsIdsListResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get files list by ids`)
      return await this.filesService.getFilesListByNewsIds(newsIdsList);
    } finally {
      this.logger.log(`GetFilesList: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-files')
  async updateNewsFiles(
    @Payload() payload: IUpdateFilesRequestContract, @Ctx() context: RmqContext
  ): Promise<{success: boolean, message: string}> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update news files urls`)
      return await this.filesService.updateNewsFiles(payload.newsId, payload.images, payload.videos);
    } finally {
      this.logger.log(`UpdateNewsFiles: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('delete-files')
  async deleteImages(@Payload() newsId, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete files`)
      await this.filesService.deleteFiles(newsId)
      await channel.ack(originalMessage)
      this.logger.log(`DeleteFiles: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`DeleteFiles: Acknowledge message success`)
      }
    }
  }
}
