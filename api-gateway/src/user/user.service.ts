import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";

@Injectable()
export class UserService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async getAllUsers() {
    const response = this.clientAuth.send('get-all-users', '')
    return await lastValueFrom(response)
  }

  async searchUsers(dto: SearchUsersDto) {
    const response = this.clientAuth.send('search-users', dto)
    return await lastValueFrom(response)
  }

  async getUserById(id: number) {
    const response = this.clientAuth.send('get-user-by-id', id)
    return await lastValueFrom(response)
  }

  async getUserProfile(id: number) {
    const response = this.clientAuth.send('get-user-profile', id)
    return await lastValueFrom(response)
  }

  async updateUserProfile(id: number, dto: UpdateUserProfileDto) {
    const response = this.clientAuth.send('update-user-profile', {id, ...dto})
    return await lastValueFrom(response)
  }

  async getUserAvatar(id: number) {
    const response = await this.clientAuth.send('get-user-avatar', { id })
    return await lastValueFrom(response)
  }

  async updateUserAvatar(id: number, avatar) {
    const response = this.clientAuth.send('update-user-avatar', {id, avatar})
    return await lastValueFrom(response)
  }

  async deleteUser(id: number) {
    const response = this.clientAuth.send('delete-user', id)
    return await lastValueFrom(response)
  }

  async subscribeOnUser(userId: number, subscriptionUserId: number) {
    const response = this.clientAuth.send('subscribe-on-user', {userId, subscriptionUserId})
    return await lastValueFrom(response)
  }
}
