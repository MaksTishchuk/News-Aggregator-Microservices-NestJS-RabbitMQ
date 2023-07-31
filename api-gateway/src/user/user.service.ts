import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {SearchUsersDto} from "./dto/search-users.dto";

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

  async getUserById(id) {
    const response = this.clientAuth.send('get-user-by-id', id)
    return await lastValueFrom(response)
  }
}
