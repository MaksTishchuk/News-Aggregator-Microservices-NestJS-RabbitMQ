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

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existsUser = await this.userRepository.findOneBy({email: dto.email})
    if (existsUser) throw new RpcException(new BadRequestException('User with this credentials already exists!'))
    const hashPassword = await bcryptjs.hash(dto.password, 10)
    const newUser = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashPassword,
      isActivated: true
    })
    const user = await this.userRepository.save(newUser)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user)}
  }

  async validateUser(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {email: dto.email},
      select: ['id', 'username', 'email', 'password', 'role']
    })
    if (!user) throw new RpcException(new NotFoundException('User was not found!'))
    const isValidPassword = await bcryptjs.compare(dto.password, user.password)
    if (!isValidPassword) throw new RpcException(new NotFoundException('Invalid credentials!'))
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
