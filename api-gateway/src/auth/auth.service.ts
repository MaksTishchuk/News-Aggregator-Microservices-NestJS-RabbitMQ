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
    const response = this.clientAuth.send({cmd: 'register'}, dto)
    return await lastValueFrom(response)
  }

  async login(dto: LoginDto) {
    const response = this.clientAuth.send({cmd: 'login'}, dto)
    return await lastValueFrom(response)
  }
}
