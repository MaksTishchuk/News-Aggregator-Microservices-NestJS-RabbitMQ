import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {lastValueFrom} from "rxjs";

@Injectable()
export class AuthService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async register(dto: RegisterDto) {
    console.log('API-gateway register service')
    const result = this.clientAuth.send({cmd: 'register'}, dto)
    return await lastValueFrom(result)
  }

  async login(dto: LoginDto) {
    console.log('API-gateway login service')
    const result = this.clientAuth.send({cmd: 'login'}, dto)
    return await lastValueFrom(result)
  }
}
