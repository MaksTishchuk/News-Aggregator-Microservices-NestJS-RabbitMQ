import {Body, Controller, Logger, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {LoggerDto} from "../common/dto/logger.dto";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {MicroservicesEnum} from "../common/enums/microservices.enum";

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    private authService: AuthService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`Try to register user`)
    const payload: LoggerDto = {
      type: LogTypeEnum.action,
      microservice: MicroservicesEnum.apiGateway,
      message: 'Try to register user',
      additionalInfo: ''
    }
    this.clientLogger.emit('create-log', payload)
    return await this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Try to login user`)
    return await this.authService.login(dto);
  }
}
