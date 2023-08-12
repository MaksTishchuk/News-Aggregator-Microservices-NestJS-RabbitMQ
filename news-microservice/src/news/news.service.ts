import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NewsEntity} from "../entities/news.entity";
import {In, Repository} from "typeorm";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {CreateNewsDto} from "./dto/create-news.dto";
import {makeLoggerPayload} from "../common/logger.payload";
import {LoggerDto} from "../common/dto/logger.dto";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {RpcException} from "@nestjs/microservices";
import {getPagination} from "../common/pagination";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {lastValueFrom} from "rxjs";
import { File } from 'multer'
import {
  IDeleteNewsRequestContract, IDeleteNewsResponseContract, IFindOneNewsResponseContract,
  IGetAllNewsRequestContract, IGetAllNewsResponseContract, ISearchNewsRequestContract,
  ISearchNewsResponseContract, IUpdateNewsResponseContract, IUserSubscriptionNewsRequestContract,
  IUserSubscriptionNewsResponseContract
} from "./contracts";

@Injectable()
export class NewsService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()
  private clientFiles = this.clientProxyRMQ.getClientProxyFilesInstance()

  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async createNews(createNewsDto: CreateNewsDto, images: File[]): Promise<void> {
    try {
      const news: NewsEntity = this.newsRepository.create({...createNewsDto});
      if (images) news.isImages = true
      const createdNews: NewsEntity = await this.newsRepository.save(news)
      if (images) this.clientFiles.emit('create-images', {newsId: createdNews.id, images})
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.action,
        `CreateNews: User with id "${createNewsDto.authorId}" created news!`
      )
      this.clientLogger.emit('create-log', payload)
    } catch (err) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        err.message
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(err.message))
    }
  }

  async findAllNews(data: IGetAllNewsRequestContract): Promise<IGetAllNewsResponseContract> {
    const {perPage, skip} = getPagination(data)
    return await this.newsRepository.find({
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async getUserSubscriptionsNews(
    data: IUserSubscriptionNewsRequestContract
  ): Promise<IUserSubscriptionNewsResponseContract> {
    const {perPage, skip} = getPagination(data.pagination)
    return await this.newsRepository.find({
      where: {authorId: In(data.authorIds)},
      order: {createdAt: 'DESC'},
      take: perPage,
      skip
    });
  }

  async searchNews(data: ISearchNewsRequestContract): Promise<ISearchNewsResponseContract> {
    const {perPage, skip} = getPagination(data)
    const qb = this.newsRepository.createQueryBuilder('n');
    qb.take(perPage);
    qb.skip(skip);
    qb.orderBy('id', 'DESC');
    if (data.title) qb.orWhere(`n.title ILIKE :title`);
    if (data.body) qb.orWhere(`n.body ILIKE :body`);
    qb.setParameters({
      title: `%${data.title}%`,
      body: `%${data.body}%`,
    });
    const [news, total] = await qb.getManyAndCount();
    return { news, total };
  }

  async findOneNews(id: number): Promise<IFindOneNewsResponseContract> {
    const news: NewsEntity = await this.findNewsById(id);
    news.views += 1;
    await this.newsRepository.save(news);
    return news;
  }

  async findNewsById(id: number): Promise<NewsEntity> {
    const news: NewsEntity = await this.newsRepository.findOne({where: { id }});
    if (!news) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `findNewsById: News with id "${id}" was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException(`News with id "${id}" was not found!`));
    }
    return news;
  }

  async updateNews(dto: UpdateNewsDto, images: File[]): Promise<IUpdateNewsResponseContract> {
    const news: NewsEntity = await this.findNewsById(dto.id);
    if (news.authorId === dto.authorId) {
      const updatedNews = await this.newsRepository.createQueryBuilder()
        .update<NewsEntity>(NewsEntity, {...dto, isImages: images ? true : news.isImages})
        .where('id = :id', {id: dto.id})
        .returning('*')
        .updateEntity(true)
        .execute()
      if (!updatedNews.affected) {
        const payload: LoggerDto = makeLoggerPayload(
          LogTypeEnum.warning,
          `UpdateNews: News with id "${dto.id}" has not been updated!`
        )
        this.clientLogger.emit('create-log', payload)
        throw new RpcException(new BadRequestException(`News with id "${dto.id}" has not been updated!`))
      }
      if (images) {
        const updateImagesResponse = this.clientFiles.send('update-images', {newsId: dto.id, images})
        await lastValueFrom(updateImagesResponse)
      }
      return updatedNews.raw[0]
    } else {
      throw new RpcException(new BadRequestException(
        `News with id "${dto.id}" has not been updated! Access denied!`,
      ));
    }
  }

  async deleteNews(data: IDeleteNewsRequestContract): Promise<IDeleteNewsResponseContract> {
    const news: NewsEntity = await this.findNewsById(data.id);
    if (news.authorId === data.authorId) {
      const result = await this.newsRepository.delete({ id: data.id });
      if (!result.affected) {
        throw new RpcException(new NotFoundException(
          `News with id "${data.id}" was not deleted!`,
        ));
      }
      if (news.isImages) this.clientFiles.emit('delete-images', news.id)
      return { success: true, message: 'News has been deleted!' };
    } else {
      throw new RpcException(new BadRequestException(
        `News with id "${data.id}" was not deleted! Access denied!`,
      ));
    }
  }
}
