import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import {JwtPayloadInterface} from "../interfaces/jwt-payload.interface";
import {UserEntity} from "../../user/entities/user.entity";
import {UserService} from "../../user/user.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')
    })
  }

  async validate(payload: JwtPayloadInterface): Promise<UserEntity> {
    const { id } = payload
    return await this.userService.getUserById(id)
  }
}
