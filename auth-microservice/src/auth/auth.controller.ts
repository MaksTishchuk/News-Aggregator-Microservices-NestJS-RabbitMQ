import {Controller, Logger} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({cmd: 'register'})
  async register(@Payload() dto: RegisterDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    try {
      this.logger.log(`Try to register user`)
      const result = await this.authService.register(dto)
      return result
    } finally {
      this.logger.log(`Register: Acknowledge message success`)
      await channel.ack(originalMessage)
    }
  }

  @MessagePattern({cmd: 'login'})
  async login(@Payload() dto: LoginDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    try {
      this.logger.log(`Try to login user`)
      const result = await this.authService.login(dto)
      return result
    } finally {
      this.logger.log(`Login: Acknowledge message success`)
      await channel.ack(originalMessage)
    }
  }
}
