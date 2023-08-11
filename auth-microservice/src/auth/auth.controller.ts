import {Controller, Logger} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {IRegisterRequestContract} from "./contracts/register.request.contract";
import {IRegisterResponseContract} from "./contracts/register.response.contract";
import {ILoginRequestContract} from "./contracts/login.request.contract";
import {ILoginResponseContract} from "./contracts/login.response.contract";

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({cmd: 'register'})
  async register(@Payload() request: IRegisterRequestContract, @Ctx() context: RmqContext): Promise<IRegisterResponseContract> {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    try {
      this.logger.log(`Try to register user with email ${request.email}`)
      return await this.authService.register(request)
    } finally {
      this.logger.log(`Register: Acknowledge message success`)
      await channel.ack(originalMessage)
    }
  }

  @MessagePattern({cmd: 'login'})
  async login(@Payload() request: ILoginRequestContract, @Ctx() context: RmqContext): Promise<ILoginResponseContract> {
    const channel = context.getChannelRef()
    const originalMessage = context.getMessage()
    try {
      this.logger.log(`Try to login user with email ${request.email}`)
      return await this.authService.login(request)
    } finally {
      this.logger.log(`Login: Acknowledge message success`)
      await channel.ack(originalMessage)
    }
  }
}
