import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, Repository} from "typeorm";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {CommentEntity} from "../entities/comment.entity";
import {LoggerDto} from "../common/dto/logger.dto";
import {makeLoggerPayload} from "../common/logger.payload";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {RpcException} from "@nestjs/microservices";
import {CreateCommentDto} from "./dto/create-comment.dto";
import {NewsEntity} from "../entities/news.entity";
import {PaginationDto} from "../common/dto/pagination.dto";
import {getPagination} from "../common/pagination";

@Injectable()
export class CommentsService {

  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async createComment(dto: CreateCommentDto) {
    const news = await this.newsRepository.findOne({where: {id: dto.newsId}})
    if (!news) {
      throw new RpcException(new NotFoundException(`News with id "${dto.newsId}" was not found!`));
    }
    let parentComment = null
    if (dto.parentCommentId) {
      parentComment = await this.commentRepository.findOne({where: {id: dto.parentCommentId}})
    }
    try {
      const comment = this.commentRepository.create({
        ...dto,
        news,
        replyTo: parentComment
      })
      return await this.commentRepository.save(comment)
    } catch (err) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        err.message
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(err.message))
    }
  }

  async findAllComments() {
    return await this.commentRepository.find({
      where: {parentCommentId: IsNull()},
      relations: ['replies'],
      order: { createdAt: 'DESC' },
    });
  }
}
