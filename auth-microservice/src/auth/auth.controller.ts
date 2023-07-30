import {Controller, Logger} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {RegisterDto} from "./dto/register.dto";
import {AckErrors} from "../utils/ack-errors";
import {LoginDto} from "./dto/login.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({cmd: 'register'})
  async register(@Payload() dto: RegisterDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    Logger.log(`Try to register user with credentials`)
    try {
      Logger.log(`Register Try`)
      await channel.ack(originalMessage)
      return await this.authService.register(dto)
    } catch (error) {
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        Logger.log(`Register failed`)
      }
    }
  }

  @MessagePattern({cmd: 'login'})
  async login(@Payload() dto: LoginDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    Logger.log(`Try to login user with credentials: ${dto}`)
    try {
      Logger.log(`Login Try`)
      await channel.ack(originalMessage)
      return await this.authService.login(dto)
    } catch (error) {
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        Logger.log(`Login failed`)
      }
    }
  }
}
