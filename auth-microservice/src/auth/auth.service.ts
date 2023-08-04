import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../user/entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import * as bcryptjs from 'bcryptjs'
import {JwtPayloadInterface} from "./interfaces/jwt-payload.interface";
import {RpcException} from "@nestjs/microservices";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {makeLoggerPayload} from "../utils/logger.payload";
import {LoggerDto} from "../utils/dto/logger.dto";
import {LogTypeEnum} from "../utils/enums/log-type.enum";

@Injectable()
export class AuthService {
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  async register(dto: RegisterDto) {
    const existsUser = await this.userRepository.findOneBy({email: dto.email})
    if (existsUser) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Register: User with email "${dto.email}" already exists!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new BadRequestException('User with this credentials already exists!'))
    }
    const hashPassword = await bcryptjs.hash(dto.password, 10)
    const newUser = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashPassword,
      isActivated: true
    })
    const user = await this.userRepository.save(newUser)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Register user with email "${dto.email}" success!`
    )
    this.clientLogger.emit('create-log', payload)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Login user with email "${dto.email}" success!`
    )
    this.clientLogger.emit('create-log', payload)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async validateUser(dto: LoginDto) {
    const user = await this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.email', 'user.password', 'user.role'])
      .addSelect("user.password")
      .where('user.email = :email', { email: dto.email })
      .getOne()
    if (!user) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Login: User with email "${dto.email}" was not found!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException('User was not found!'))
    }
    const isValidPassword = await bcryptjs.compare(dto.password, user.password)
    if (!isValidPassword) {
      const payload: LoggerDto = makeLoggerPayload(
        LogTypeEnum.warning,
        `Login: User with email "${dto.email}" sent invalid credentials!`
      )
      this.clientLogger.emit('create-log', payload)
      throw new RpcException(new NotFoundException('Invalid credentials!'))
    }
    return user
  }

  async getAccessToken(user: UserEntity) {
    const payload: JwtPayloadInterface = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
    return this.jwtService.sign(payload)
  }

  returnUserFields(user: UserEntity) {
    return {id: user.id, username: user.username, email: user.email, role: user.role}
  }
}
