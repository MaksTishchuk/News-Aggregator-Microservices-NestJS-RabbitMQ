import { Injectable } from '@nestjs/common';
import { File } from 'multer'
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {
  IGetAllUsersRequestContract, IGetAllUsersResponseContract,
  IGetUserByIdResponseContract, IGetUserProfileResponseContract,
  ISearchUsersRequestContract, ISearchUsersResponseContract,
  ISubscribeOnUserRequestContract, ISubscribeOnUserResponseContract,
  IUpdateUserAvatarRequestContract, IUpdateUserProfileRequestContract,
  IUpdateUserProfileResponseContract
} from "./contracts";
import {IUserEntity} from "./interfaces/user-entity.interface";
import {IUserEntityWithSubscribe} from "./interfaces/user-entity-with-subscribe.interface";


@Injectable()
export class UserService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async getAllUsers(paginationDto: PaginationDto): Promise<IUserEntity[]> {
    const payload: IGetAllUsersRequestContract = {...paginationDto}
    const response = this.clientAuth.send('get-all-users', payload)
    const responseBody: IGetAllUsersResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async searchUsers(dto: SearchUsersDto): Promise<IUserEntity[]> {
    const payload: ISearchUsersRequestContract = {...dto}
    const response = this.clientAuth.send('search-users', payload)
    const responseBody: ISearchUsersResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async getUserById(id: number): Promise<IUserEntityWithSubscribe> {
    const response = this.clientAuth.send('get-user-by-id', id)
    const responseBody: IGetUserByIdResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async getUserProfile(id: number): Promise<IUserEntityWithSubscribe> {
    const response = this.clientAuth.send('get-user-profile', id)
    const responseBody: IGetUserProfileResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async updateUserProfile(id: number, dto: UpdateUserProfileDto): Promise<IUserEntityWithSubscribe> {
    const payload: IUpdateUserProfileRequestContract = {id, ...dto}
    const response = this.clientAuth.send('update-user-profile', payload)
    const responseBody: IUpdateUserProfileResponseContract =  await lastValueFrom(response)
    return responseBody
  }

  async getUserAvatar(id: number): Promise<string> {
    const response = await this.clientAuth.send('get-user-avatar', id)
    return await lastValueFrom(response)
  }

  async updateUserAvatar(id: number, avatar: File): Promise<IUserEntityWithSubscribe> {
    const payload: IUpdateUserAvatarRequestContract = {id, avatar}
    const response = this.clientAuth.send('update-user-avatar', payload)
    const responseBody: IUpdateUserProfileResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async deleteUser(id: number): Promise<void> {
    this.clientAuth.emit('delete-user', id)
  }

  async subscribeOnUser(userId: number, subscriptionUserId: number): Promise<IUserEntityWithSubscribe> {
    const payload: ISubscribeOnUserRequestContract = {userId, subscriptionUserId}
    const response = this.clientAuth.send('subscribe-on-user', payload)
    const responseBody: ISubscribeOnUserResponseContract = await lastValueFrom(response)
    return responseBody
  }
}
