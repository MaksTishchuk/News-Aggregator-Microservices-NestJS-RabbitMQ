import { Injectable } from '@nestjs/common';
import { File } from 'multer'
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {
  IGetAllUsersRequestContract, IGetAllUsersResponseContract, IGetUserByIdResponseContract,
  IGetUserProfileResponseContract, ISearchUsersRequestContract, ISearchUsersResponseContract,
  ISubscribeOnUserRequestContract, ISubscribeOnUserResponseContract, IUpdateUserAvatarRequestContract,
  IUpdateUserAvatarResponseContract, IUpdateUserProfileRequestContract, IUpdateUserProfileResponseContract
} from "./contracts";


@Injectable()
export class UserService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async getAllUsers(paginationDto: PaginationDto): Promise<IGetAllUsersResponseContract> {
    const payload: IGetAllUsersRequestContract = {...paginationDto}
    const response = this.clientAuth.send('get-all-users', payload)
    return await lastValueFrom(response)
  }

  async searchUsers(dto: SearchUsersDto): Promise<ISearchUsersResponseContract> {
    const payload: ISearchUsersRequestContract = {...dto}
    const response = this.clientAuth.send('search-users', payload)
    return await lastValueFrom(response)
  }

  async getUserById(id: number): Promise<IGetUserByIdResponseContract> {
    const response = this.clientAuth.send('get-user-by-id', id)
    return await lastValueFrom(response)
  }

  async getUserProfile(id: number): Promise<IGetUserProfileResponseContract> {
    const response = this.clientAuth.send('get-user-profile', id)
    return await lastValueFrom(response)
  }

  async updateUserProfile(id: number, dto: UpdateUserProfileDto): Promise<IUpdateUserProfileResponseContract> {
    const payload: IUpdateUserProfileRequestContract = {id, ...dto}
    const response = this.clientAuth.send('update-user-profile', payload)
    return await lastValueFrom(response)
  }

  async getUserAvatar(id: number): Promise<string> {
    const response = await this.clientAuth.send('get-user-avatar', id)
    return await lastValueFrom(response)
  }

  async updateUserAvatar(id: number, avatar: File): Promise<IUpdateUserAvatarResponseContract> {
    const payload: IUpdateUserAvatarRequestContract = {id, avatar}
    const response = this.clientAuth.send('update-user-avatar', payload)
    return await lastValueFrom(response)
  }

  async deleteUser(id: number): Promise<void> {
    this.clientAuth.emit('delete-user', id)
  }

  async subscribeOnUser(userId: number, subscriptionUserId: number): Promise<ISubscribeOnUserResponseContract> {
    const payload: ISubscribeOnUserRequestContract = {userId, subscriptionUserId}
    const response = this.clientAuth.send('subscribe-on-user', payload)
    return await lastValueFrom(response)
  }
}
