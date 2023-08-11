import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import * as bcryptjs from 'bcryptjs'
import {JwtPayloadInterface} from "./interfaces/jwt-payload.interface";
import {RpcException} from "@nestjs/microservices";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {makeLoggerPayload} from "../utils/logger.payload";
import {LoggerDto} from "../utils/dto/logger.dto";
import {LogTypeEnum} from "../utils/enums/log-type.enum";
import {IRegisterRequestContract} from "./contracts/register.request.contract";
import {IRegisterResponseContract} from "./contracts/register.response.contract";
import {ILoginRequestContract} from "./contracts/login.request.contract";
import {ILoginResponseContract, IUserResponse} from "./contracts/login.response.contract";

@Injectable()
export class AuthService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async register(data: IRegisterRequestContract): Promise<IRegisterResponseContract> {
    const existsUser: UserEntity = await this.userRepository.findOneBy({email: data.email})
    if (existsUser) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Register: User with email "${data.email}" already exists!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException('User with this credentials already exists!'))
    }
    const hashPassword: string = await bcryptjs.hash(data.password, 10)
    const newUser: UserEntity = await this.userRepository.create({
      username: data.username,
      email: data.email,
      password: hashPassword,
      isActivated: true
    })
    const user: UserEntity = await this.userRepository.save(newUser)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Register user with email "${data.email}" success!`
    )
    this.clientLogger.emit('create-log', payload)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async login(data: ILoginRequestContract): Promise<ILoginResponseContract> {
    const user: UserEntity = await this.validateUser(data)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Login user with email "${data.email}" success!`
    )
    this.clientLogger.emit('create-log', payload)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async validateUser(data: ILoginRequestContract): Promise<UserEntity> {
    const user: UserEntity = await this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.password', 'user.role'])
      .addSelect("user.password")
      .where('user.email = :email', { email: data.email })
      .getOne()
    if (!user) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Login: User with email "${data.email}" was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException('User was not found!'))
    }
    const isValidPassword: boolean = await bcryptjs.compare(data.password, user.password)
    if (!isValidPassword) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Login: User with email "${data.email}" sent invalid credentials!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException('Invalid credentials!'))
    }
    return user
  }

  async getAccessToken(user: UserEntity): Promise<string> {
    const payload: JwtPayloadInterface = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
    return this.jwtService.sign(payload)
  }

  returnUserFields(user: UserEntity): IUserResponse {
    return {id: user.id, username: user.username, email: user.email, role: user.role}
  }
}
