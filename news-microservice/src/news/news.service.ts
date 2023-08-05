import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {NewsEntity} from "../entities/news.entity";
import {Repository} from "typeorm";
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

@Injectable()
export class NewsService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async createNews(createNewsDto: CreateNewsDto): Promise<NewsEntity> {
    try {
      const news = this.newsRepository.create({...createNewsDto});
      await this.newsRepository.save(news)
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.action,
        `CreateNews: User with id "${createNewsDto.authorId}" created news!`
      )
      this.clientLogger.emit('create-log', payload)
      return news
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
    console.log(dto)
    const {perPage, skip} = getPagination(dto)
    console.log(perPage, skip)
    return await this.newsRepository.find({
      relations: ['comments'],
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async searchNews(dto: SearchNewsDto) {
    console.log(dto)
    const {perPage, skip} = getPagination(dto)
    console.log(perPage, skip)
    const qb = this.newsRepository.createQueryBuilder('n');
    qb.take(perPage);
    qb.skip(skip);
    qb.orderBy('id', 'DESC');
    if (dto.title) {
      qb.orWhere(`n.title ILIKE :title`);
    }
    if (dto.body) {
      qb.orWhere(`n.body ILIKE :body`);
    }
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
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['comments'],
    });
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

  async updateNews(dto: UpdateNewsDto): Promise<NewsEntity> {
    const news = await this.findNewsById(dto.id);
    if (news.authorId === dto.authorId) {
      const updatedNews = await this.newsRepository.createQueryBuilder()
        .update<NewsEntity>(NewsEntity, dto)
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
      return updatedNews.raw[0]
    } else {
      throw new RpcException(new BadRequestException(
        `News with id "${dto.id}" was not updated! Access denied!`,
      ));
    }
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
      return { success: true, message: 'News has been deleted!' };
    } else {
      throw new RpcException(new BadRequestException(
        `News with id "${dto.id}" was not deleted! Access denied!`,
      ));
    }
  }
}
