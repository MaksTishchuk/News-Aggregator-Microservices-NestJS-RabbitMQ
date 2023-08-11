import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ILike, In, Repository} from "typeorm";
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
import {
  IGetAllUsersResponseContract, IGetUserByIdResponseContract, IGetUserProfileResponseContract,
  ISearchUsersRequestContract, ISubscribeOnUserResponseContract, IUpdateUserAvatarRequestContract,
  IUpdateUserAvatarResponseContract, IUpdateUserProfileResponseContract
} from "./contracts";

@Injectable()
export class UserService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async getAllUsers(data: PaginationDto): Promise<IGetAllUsersResponseContract> {
    const {perPage, skip} = getPagination(data)
    return await this.userRepository.find({order: {createdAt: 'desc'}, take: perPage, skip})
  }

  async getUserSubscriptions(id: number) {
    const user = await this.getUserById(id)
    return user.subscriptions
  }

  async searchUsers(data: ISearchUsersRequestContract): Promise<IGetAllUsersResponseContract> {
    if (!data.username && !data.email) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.error,
        `SearchUsers: Search fields should not be empty!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException('Search fields should not be empty!'))
    }
    return await this.userRepository.findBy([
      { username: ILike(`%${data.username}%`) },
      { email: ILike(`%${data.email}%`) },
    ]);
  }

  async getUsersByIds(ids: []): Promise<UserEntity[]> {
    return await this.userRepository.find(
      {
        where: {id: In(ids)},
        select: ['id', 'email', 'username', 'avatar', 'firstName', 'lastName']
      }
    )
  }

  async getUserById(id: number): Promise<IGetUserByIdResponseContract> {
    const user: UserEntity = await this.userRepository.findOne({
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

  async getUserProfile(userId: number): Promise<IGetUserProfileResponseContract> {
    return await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscribers')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .where('user.id = :id', { id: userId })
      .getOne()
  }

  async updateUserProfile(dto: UpdateUserProfileDto): Promise<IUpdateUserProfileResponseContract> {
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
    return await this.getUserProfile(dto.id)
  }

  async getUserAvatar(id: number): Promise<string> {
    const user = await this.getUserById(id)
    return this.configService.get<string>('SERVER_URL') + '/images/' + user.avatar
  }

  async updateUserAvatar(data: IUpdateUserAvatarRequestContract): Promise<IUpdateUserAvatarResponseContract> {
    if (data.avatar) {
      const avatar = createFile(data.avatar);
      return await this.updateUserProfile({id: data.id, avatar})
    }
    return await this.getUserById(data.id)
  }

  async deleteUser(id: number): Promise<void> {
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

  async subscribeOnUser(userId: number, subscriptionUserId: number): Promise<ISubscribeOnUserResponseContract> {
    if (userId === subscriptionUserId) {
      throw new RpcException(
        new BadRequestException(`User with id "${userId}" cannot subscribe to himself!`)
      )
    }
    const users: UserEntity[] = await this.userRepository.find({
      where: {id: In([userId, subscriptionUserId])},
      relations: ['subscribers', 'subscriptions']
    })
    let subscriptionUser, user
    for (const findUser of users) {
      if (findUser.id === subscriptionUserId) subscriptionUser = findUser
      else if (findUser.id === userId) user = findUser
    }
    if (!subscriptionUser) {
      throw new RpcException(new NotFoundException(`User with id ${subscriptionUserId} was not found!`))
    }
    let message
    if (subscriptionUser.subscribers.find(subscriber => subscriber.id === user.id)) {
      subscriptionUser.subscribers = subscriptionUser.subscribers.filter((subscriber) => subscriber.id !== user.id)
      message = `SubscribeOnUser: User with id "${userId}" unsubscribed from user with id "${subscriptionUserId}"!`
    } else {
      subscriptionUser.subscribers.push(user)
      message = `SubscribeOnUser: User with id "${userId}" subscribe on user with id "${subscriptionUserId}"!`
    }
    const payload: LoggerDto = makeLoggerPayload(LogTypeEnum.action, message)
    this.clientLogger.emit('create-log', payload)
    await this.userRepository.save(subscriptionUser)
    return await this.getUserById(subscriptionUser.id)
  }

}
