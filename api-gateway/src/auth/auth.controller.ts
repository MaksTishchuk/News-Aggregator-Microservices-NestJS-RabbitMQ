import {Body, Controller, HttpCode, HttpStatus, Logger, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {LoggerDto} from "../common/dto/logger.dto";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {makeLoggerPayload} from "../common/utils/logger.payload";
import {RegisterResponseType} from "./types/register.response.type";
import {LoginResponseType} from "./types/login.response.type";
import {
  ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import {AuthResponseDto} from "./swagger-response/auth-response.dto";
import {ExceptionResponseDto} from "../common/swagger-response/exception-response.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(
    private authService: AuthService,
    private clientProxyRMQ: ClientProxyRMQ
  ) {}

  @ApiOperation({ description: 'User registration' })
  @ApiCreatedResponse({
    status: 201,
    type: AuthResponseDto,
    description: 'User has been registered!'
  })
  @HttpCode(201)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseType> {
    this.logger.log(`Try to register user with email ${dto.email}`)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Try to register user with email: ${dto.email}`
    )
    this.clientLogger.emit('create-log', payload)
    return await this.authService.register(dto)
  }

  @ApiOperation({ description: 'User login' })
  @ApiOkResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'User has been login!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User was not found or Invalid credentials!'
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponseType> {
    this.logger.log(`Try to login user with email ${dto.email}`)
    const payload: LoggerDto = makeLoggerPayload(
      LogTypeEnum.action,
      `Try to login user with email: ${dto.email}`
    )
    this.clientLogger.emit('create-log', payload)
    return await this.authService.login(dto);
  }
}
