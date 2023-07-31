import {Controller, Logger, UseFilters} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {RegisterDto} from "./dto/register.dto";
import {AckErrors} from "../utils/ack-errors";
import {LoginDto} from "./dto/login.dto";

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({cmd: 'register'})
  async register(@Payload() dto: RegisterDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    this.logger.log(`Try to register user`)
    try {
      const result = await this.authService.register(dto)
      await channel.ack(originalMessage)
      this.logger.log(`Register success`)
      return result
    } catch (error) {
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.error(`Register failed: ${error.message}`)
      }
    }
  }

  @MessagePattern({cmd: 'login'})
  async login(@Payload() dto: LoginDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    this.logger.log(`Try to login user`)
    try {
      const result = await this.authService.login(dto)
      await channel.ack(originalMessage)
      this.logger.log(`Login success`)
      return result
    } catch (error) {
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.error(`Login failed: ${error.message}`)
      }
    }
  }
}
