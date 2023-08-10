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
import {PaginationDto} from "../common/dto/pagination.dto";
import {getPagination} from "../common/pagination";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {DeleteNewsDto} from "./dto/delete-news.dto";
import {lastValueFrom} from "rxjs";

@Injectable()
export class NewsService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()
  private clientFiles = this.clientProxyRMQ.getClientProxyFilesInstance()

  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async createNews(createNewsDto: CreateNewsDto, images: []) {
    try {
      const news = this.newsRepository.create({...createNewsDto});
      if (images) news.isImages = true
      const createdNews = await this.newsRepository.save(news)
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

  async findAllNews(dto: PaginationDto): Promise<NewsEntity[]> {
    const {perPage, skip} = getPagination(dto)
    return await this.newsRepository.find({
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async searchNews(dto: SearchNewsDto) {
    const {perPage, skip} = getPagination(dto)
    const qb = this.newsRepository.createQueryBuilder('n');
    qb.take(perPage);
    qb.skip(skip);
    qb.orderBy('id', 'DESC');
    if (dto.title) qb.orWhere(`n.title ILIKE :title`);
    if (dto.body) qb.orWhere(`n.body ILIKE :body`);
    qb.setParameters({
      title: `%${dto.title}%`,
      body: `%${dto.body}%`,
    });
    const [news, total] = await qb.getManyAndCount();
    return { news, total };
  }

  async findOneNews(id: number): Promise<NewsEntity> {
    const news = await this.findNewsById(id);
    news.views += 1;
    await this.newsRepository.save(news);
    return news;
  }

  async findNewsById(id: number): Promise<NewsEntity> {
    const news = await this.newsRepository.findOne({where: { id }});
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

  async updateNews(dto: UpdateNewsDto, images: []): Promise<NewsEntity> {
    const news = await this.findNewsById(dto.id);
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

  async getUserSubscriptionsNews(payload) {
    const {perPage, skip} = getPagination(payload.pagination)
    return await this.newsRepository.find({
      where: {authorId: In(payload.authorIds)},
      order: {createdAt: 'DESC'},
      take: perPage,
      skip
    });
  }

  async deleteNews(dto: DeleteNewsDto) {
    const news = await this.findNewsById(dto.id);
    if (news.authorId === dto.authorId) {
      const result = await this.newsRepository.delete({ id: dto.id });
      if (!result.affected) {
        throw new RpcException(new NotFoundException(
          `News with id "${dto.id}" was not deleted!`,
        ));
      }
      if (news.isImages) this.clientFiles.emit('delete-images', news.id)
      return { success: true, message: 'News has been deleted!' };
    } else {
      throw new RpcException(new BadRequestException(
        `News with id "${dto.id}" was not deleted! Access denied!`,
      ));
    }
  }
}
