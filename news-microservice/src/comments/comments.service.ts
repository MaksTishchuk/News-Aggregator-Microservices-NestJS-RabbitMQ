import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, Repository} from "typeorm";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {CommentEntity} from "../entities/comment.entity";
import {LoggerDto} from "../common/dto/logger.dto";
import {makeLoggerPayload} from "../common/logger.payload";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {RpcException} from "@nestjs/microservices";
import {NewsEntity} from "../entities/news.entity";
import {getPagination} from "../common/pagination";
import {
  ICreateCommentRequestContract, ICreateCommentResponseContract, IDeleteCommentRequestContract,
  IDeleteCommentResponseContract, IFindAllCommentsRequestContract, IFindAllCommentsResponseContract,
  IFindCommentByIdResponseContract, IFindNewsCommentsResponseContract, IUpdateCommentRequestContract,
  IUpdateCommentResponseContract
} from "./contracts";
import {IPaginationInterface} from "../common/interfaces/pagination.interface";

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

  async createComment(data: ICreateCommentRequestContract): Promise<ICreateCommentResponseContract> {
    const news: NewsEntity = await this.newsRepository.findOne({where: {id: data.newsId}})
    if (!news) {
      throw new RpcException(new NotFoundException(`News with id "${data.newsId}" was not found!`));
    }
    let parentComment = null
    if (data.parentCommentId) {
      parentComment = await this.findCommentById(data.parentCommentId)
    }
    try {
      let comment: CommentEntity = this.commentRepository.create({
        ...data,
        news,
        replyTo: parentComment
      })
      comment = await this.commentRepository.save(comment)
      return comment
    } catch (err) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        err.message
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(err.message))
    }
  }

  async findAllComments(data: IFindAllCommentsRequestContract): Promise<IFindAllCommentsResponseContract> {
    const {perPage, skip} = getPagination(data)
    return await this.commentRepository.find({
      where: {parentCommentId: IsNull()},
      relations: ['replies'],
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async findNewsComments(newsId: number, data: IPaginationInterface): Promise<IFindNewsCommentsResponseContract> {
    const {perPage, skip} = getPagination(data)
    return await this.commentRepository.find({
      where: {newsId, parentCommentId: IsNull()},
      relations: ['replies'],
      order: { createdAt: 'DESC' },
      take: perPage,
      skip
    });
  }

  async findCommentById(id: number): Promise<IFindCommentByIdResponseContract> {
    const comment: CommentEntity = await this.commentRepository.findOne({where: { id }, relations: ['replies']});
    if (!comment) {
      throw new RpcException(new NotFoundException(`Comment with id "${id}" was not found!`));
    }
    return comment;
  }

  async updateComment(dto: IUpdateCommentRequestContract): Promise<IUpdateCommentResponseContract> {
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

  async deleteComment(data: IDeleteCommentRequestContract): Promise<IDeleteCommentResponseContract> {
    const comment = await this.findCommentById(data.commentId);
    if (comment.authorId === data.authorId) {
      let result
      if (comment.repliesCount === 0) {
        result = await this.commentRepository.delete({id: data.commentId});
      } else {
        result = await this.commentRepository.update(
          {id: data.commentId},
          {text: 'DELETED', isDeleted: true},
        )
      }
      if (!result.affected) {
        throw new RpcException(new NotFoundException(
          `Comment with id "${data.commentId}" has not been deleted!`,
        ));
      }
      return {success: true, message: 'Comment has been deleted!' };
    } else {
      throw new RpcException(new BadRequestException(
        `Comment with id "${data.commentId}" has not been deleted! Access denied!`,
      ));
    }
  }
}
