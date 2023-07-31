import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {catchError, lastValueFrom, throwError} from "rxjs";
import {RpcException} from "@nestjs/microservices";

@Injectable()
export class AuthService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async register(dto: RegisterDto) {
    return this.clientAuth
      .send({cmd: 'register'}, dto)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))))
  }

  async login(dto: LoginDto) {
    return this.clientAuth
      .send({cmd: 'login'}, dto)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))))
  }
}
