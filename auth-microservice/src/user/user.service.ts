import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ILike, In, Repository} from "typeorm";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {RpcException} from "@nestjs/microservices";
import {createFile, removeFile} from "../utils/file.actions";
import {ConfigService} from "@nestjs/config";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {LoggerDto} from "../utils/dto/logger.dto";
import {makeLoggerPayload} from "../utils/logger.payload";
import {LogTypeEnum} from "../utils/enums/log-type.enum";
import {PaginationDto} from "../utils/dto/pagination.dto";
import {getPagination} from "../utils/pagination";

@Injectable()
export class UserService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async getAllUsers(dto: PaginationDto): Promise<UserEntity[]> {
    const {perPage, skip} = getPagination(dto)
    return await this.userRepository.find(
      {order: {createdAt: 'desc'}, take: perPage, skip},
    )
  }

  async getUserSubscriptions(id: number): Promise<UserEntity[]> {
    const user = await this.getUserById(id)
    return user.subscriptions
  }

  async searchUsers(dto: SearchUsersDto): Promise<UserEntity[]> {
    if (!dto.username && !dto.email) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `SearchUsers: Search fields should not be empty!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException('Search fields should not be empty!'))
    }
    const users = await this.userRepository.findBy([
      { username: ILike(`%${dto.username}%`) },
      { email: ILike(`%${dto.email}%`) },
    ]);
    return users
  }

  async getUsersByIds(ids: []): Promise<UserEntity[]> {
    return await this.userRepository.find(
      {
        where: {id: In(ids)},
        select: ['id', 'email', 'username', 'avatar', 'firstName', 'lastName']
      }
    )
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {id},
      relations: ['subscribers', 'subscriptions']
    })
    if (!user) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `GetUserById: User with id "${id}" was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException(`User with id "${id}" was not found!`))
    }
    return user
  }

  async getShortUserInfoById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {id},
      select: ['id', 'email', 'username', 'avatar', 'firstName', 'lastName']
    })
    if (!user) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `GetUserById: User with id "${id}" was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException(`User with id "${id}" was not found!`))
    }
    return user
  }

  async getUserProfile(userId: number): Promise<UserEntity> {
    const profile = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscribers')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .where('user.id = :id', { id: userId })
      .getOne()
    delete profile.password
    return profile
  }

  async updateUserProfile(dto: UpdateUserProfileDto): Promise<UserEntity> {
    if (dto.avatar) {
      const user = await this.getUserById(dto.id)
      removeFile(user.avatar)
    }
    const updatedUser = await this.userRepository.createQueryBuilder()
      .update<UserEntity>(UserEntity, dto)
      .where('id = :id', {id: dto.id})
      .returning('*')
      .updateEntity(true)
      .execute()
    if (!updatedUser.affected) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `UpdateUserProfile: User with id "${dto.id}" has not been updated!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(`User with id "${dto.id}" has not been updated!`))
    }
    delete updatedUser.raw[0].password
    return updatedUser.raw[0]
  }

  async getUserAvatar(id: number) {
    const user = await this.getUserById(id)
    return this.configService.get<string>('SERVER_URL') + '/images/' + user.avatar
  }

  async updateUserAvatar(payload) {
    if (payload.avatar) {
      const avatar = createFile(payload.avatar);
      return await this.updateUserProfile({id: payload.id, avatar})
    }
    return await this.getUserById(payload.id)
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete({ id })
    if (!result.affected) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `DeleteUser: User with id "${id}" was not deleted!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(`User with id "${id}" was not deleted!`))
    }
    const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.action,
        `DeleteUser: User with id "${id}" has been deleted!`
      )
      this.clientLogger.emit('create-log', payload)
  }

  async subscribeOnUser(userId: number, subscriptionUserId: number) {
    if (userId === subscriptionUserId) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `SubscribeOnUser: User with id "${userId}" cannot subscribe to himself!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException(`User with id "${userId}" cannot subscribe to himself!`))
    }
    const users = await this.userRepository.find({
      where: {id: In([userId, subscriptionUserId])},
      relations: ['subscribers', 'subscriptions']
    })
    let subscriptionUser, user
    for (const findUser of users) {
      if (findUser.id === subscriptionUserId) subscriptionUser = findUser
      else if (findUser.id === userId) user = findUser
    }
    if (!subscriptionUser) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `SubscribeOnUser: User with id ${subscriptionUserId} was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException(
        `User with id ${subscriptionUserId} was not found!`
      ))
    }
    if (subscriptionUser.subscribers.find(subscriber => subscriber.id === user.id)) {
      subscriptionUser.subscribers = subscriptionUser.subscribers.filter(
        (subscriber) => subscriber.id !== user.id
      )
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.action,
        `SubscribeOnUser: User with id "${userId}" unsubscribed from user with id "${subscriptionUserId}"!`
      )
      this.clientLogger.emit('create-log', payload)
    } else {
      subscriptionUser.subscribers.push(user)
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.action,
        `SubscribeOnUser: User with id "${userId}" subscribe on user with id "${subscriptionUserId}"!`
      )
      this.clientLogger.emit('create-log', payload)
    }
    return await this.userRepository.save(subscriptionUser)
  }

}
