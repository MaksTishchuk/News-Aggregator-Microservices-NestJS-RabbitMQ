import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {lastValueFrom} from "rxjs";
import {IRegisterRequestContract} from "./contracts/register.request.contract";
import {ILoginRequestContract} from "./contracts/login.request.contract";
import {IRegisterResponseContract} from "./contracts/register.response.contract";
import {ILoginResponseContract} from "./contracts/login.response.contract";
import {RegisterResponseType} from "./types/register.response.type";
import {LoginResponseType} from "./types/login.response.type";

@Injectable()
export class AuthService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async register(dto: RegisterDto): Promise<RegisterResponseType> {
    const payload: IRegisterRequestContract = {...dto}
    const response = this.clientAuth.send({cmd: 'register'}, payload)
    const responseBody: IRegisterResponseContract = await lastValueFrom(response)
    return responseBody
  }

  async login(dto: LoginDto): Promise<LoginResponseType> {
    const payload: ILoginRequestContract = {...dto}
    const response = this.clientAuth.send({cmd: 'login'}, payload)
    const responseBody: ILoginResponseContract = await lastValueFrom(response)
    return responseBody
  }
}
