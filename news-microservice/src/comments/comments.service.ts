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
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {DeleteCommentDto} from "./dto/delete-comment.dto";

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
      parentComment = await this.findCommentById(dto.parentCommentId)
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

  async findAllComments(dto: PaginationDto) {
    const {perPage, skip} = getPagination(dto)
    return await this.commentRepository.find({
      where: {parentCommentId: IsNull()},
      relations: ['replies'],
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async findNewsComments(newsId: number, dto: PaginationDto) {
    const {perPage, skip} = getPagination(dto)
    return await this.commentRepository.find({
      where: {newsId, parentCommentId: IsNull()},
      relations: ['replies'],
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async findCommentById(id: number) {
    const comment = await this.commentRepository.findOne({where: { id }, relations: ['replies']});
    if (!comment) {
      throw new RpcException(new NotFoundException(`Comment with id "${id}" was not found!`));
    }
    return comment;
  }

  async updateComment(dto: UpdateCommentDto) {
    const comment = await this.findCommentById(dto.commentId);
    if (comment.authorId === dto.authorId) {
      const updatedComment = await this.commentRepository.createQueryBuilder()
        .update<CommentEntity>(CommentEntity, {text: dto.text})
        .where('id = :id', {id: dto.commentId})
        .returning('*')
        .updateEntity(true)
        .execute()
      if (!updatedComment.affected) {
        throw new RpcException(new BadRequestException(`Comment with id "${dto.commentId}" has not been updated!`))
      }
      return updatedComment.raw[0]
    } else {
      throw new RpcException(new BadRequestException(
        `Comment with id "${dto.commentId}" has not been updated! Access denied!`,
      ));
    }
  }

  async deleteComment(dto: DeleteCommentDto) {
    const comment = await this.findCommentById(dto.commentId);
    if (comment.authorId === dto.authorId) {
      let result
      if (comment.repliesCount === 0) {
        result = await this.commentRepository.delete({id: dto.commentId});
      } else {
        result = await this.commentRepository.update(
          {id: dto.commentId},
          {text: 'DELETED', isDeleted: true},
        )
      }
      if (!result.affected) {
        throw new RpcException(new NotFoundException(
          `Comment with id "${dto.commentId}" has not been deleted!`,
        ));
      }
      return {success: true, message: 'Comment has been deleted!' };
    } else {
      throw new RpcException(new BadRequestException(
        `Comment with id "${dto.commentId}" has not been deleted! Access denied!`,
      ));
    }
  }
}
