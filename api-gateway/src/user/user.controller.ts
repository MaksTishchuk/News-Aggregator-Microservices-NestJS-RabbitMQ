import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { File } from 'multer'
import {UserService} from "./user.service";
import {SearchUsersDto} from "./dto/search-users.dto";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AdminRoleGuard} from "./guards/admin-role.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import { Response } from 'express'
import {LoggerDto} from "../common/dto/logger.dto";
import {makeLoggerPayload} from "../common/utils/logger.payload";
import {LogTypeEnum} from "../common/enums/log-type.enum";
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {PaginationDto} from "../common/dto/pagination.dto";
import {
  IGetAllUsersResponseContract, IGetUserByIdResponseContract, IGetUserProfileResponseContract,
  ISearchUsersResponseContract, ISubscribeOnUserResponseContract, IUpdateUserAvatarResponseContract,
  IUpdateUserProfileResponseContract
} from "./contracts";
import {
  ApiBadRequestResponse, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation,
  ApiParam, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse
} from "@nestjs/swagger";
import {UserEntityDto} from "./swagger-response/user-entity.dto";
import {ExceptionResponseDto} from "../common/swagger-response/exception-response.dto";
import {UserEntityWithSubscribersDto} from "./swagger-response/user-entity-with-subscribers.dto";
import {AvatarDto} from "./dto/avatar.dto";

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(private userService: UserService, private clientProxyRMQ: ClientProxyRMQ) {}

  @ApiOperation({ description: 'Get all users' })
  @ApiOkResponse({
    type: [UserEntityDto],
    description: 'Get all users'
  })
  @Get('')
  @HttpCode(200)
  async getAllUsers(@Query() paginationDto: PaginationDto): Promise<IGetAllUsersResponseContract> {
    this.logger.log(`Try to get all users`)
    return await this.userService.getAllUsers(paginationDto);
  }

  @ApiOperation({ description: 'Get users by username or email' })
  @ApiOkResponse({
    type: [UserEntityDto],
    description: 'Get users by username or email'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Search fields should not be empty!'
  })
  @Get('search')
  @HttpCode(200)
  searchUsers(@Query() searchUsersDto: SearchUsersDto): Promise<ISearchUsersResponseContract> {
    this.logger.log(`Try to search users`)
    return this.userService.searchUsers(searchUsersDto);
  }

  @ApiOperation({ description: 'Get user profile' })
  @ApiOkResponse({
    type: UserEntityWithSubscribersDto,
    description: 'Get user profile'
  })
  @ApiSecurity('bearer')
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@GetCurrentUserId() id: number): Promise<IGetUserProfileResponseContract> {
    this.logger.log(`Try to get user profile`)
    return await this.userService.getUserProfile(id);
  }

  @ApiOperation({ description: 'Update user profile' })
  @ApiOkResponse({
    type: UserEntityWithSubscribersDto,
    description: 'Updated user profile!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id number}" has not been updated!'
  })
  @ApiSecurity('bearer')
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @GetCurrentUserId() id: number, @Body() dto: UpdateUserProfileDto
  ): Promise<IUpdateUserProfileResponseContract> {
    this.logger.log(`Try to update user profile`)
    return await this.userService.updateUserProfile(id, dto);
  }

  @ApiOperation({ description: 'Get user avatar' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Should be an id of user that exists in the database',
    type: Number
  })
  @ApiOkResponse({
    type: String,
    description: 'Url path to avatar!'
  })
  @Get(':userId/avatar')
  async getUserAvatar(@Res() res: Response, @Param('userId', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Try to update user avatar`)
    try {
      const response: string = await this.userService.getUserAvatar(id);
      if (response) res.redirect(response)
      else res.status(404).send('Avatar not found');
    } catch (error) {
      res.status(500).send(`Internal server error: ${error}`)
    }
  }

  @ApiOperation({ description: 'Update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: AvatarDto,
    description: 'User avatar image file'
  })
  @ApiOkResponse({
    type: UserEntityWithSubscribersDto,
    description: 'User with updated avatar!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id number}" has not been updated!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id}" was not found!'
  })
  @ApiUnprocessableEntityResponse({
    type: ExceptionResponseDto,
    description: 'Validation failed (expected type is /(jpg|jpeg|png|gif)$/)'
  })
  @ApiSecurity('bearer')
  @Patch('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @GetCurrentUserId() id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({fileType: /(jpg|jpeg|png|gif)$/})
        .addMaxSizeValidator({maxSize: 5242880})
        .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
    ) avatar: File
  ): Promise<IUpdateUserAvatarResponseContract> {
    this.logger.log(`Try to update user avatar`)
    return await this.userService.updateUserAvatar(id, avatar);
  }

  @ApiOperation({ description: 'Get user' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'Should be an id of user that exists in the database',
    type: Number
  })
  @ApiOkResponse({
    type: UserEntityWithSubscribersDto,
    description: 'Get user by id!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id}" was not found!'
  })
  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) id: number): Promise<IGetUserByIdResponseContract> {
    this.logger.log(`Try to get user by id`)
    return await this.userService.getUserById(id);
  }

  @ApiOperation({ description: 'Delete user' })
  @ApiOkResponse()
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id}" was not deleted!'
  })
  @ApiUnauthorizedResponse({
    type: ExceptionResponseDto,
    description: 'User without Admin role can`t make this request!'
  })
  @ApiSecurity('bearer')
  @Delete(':userId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async deleteUser(@Param('userId', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Try to admin delete user with id ${id}`)
    const payload: LoggerDto = makeLoggerPayload(LogTypeEnum.action, `Try to admin delete user with id ${id}`)
    this.clientLogger.emit('create-log', payload)
    await this.userService.deleteUser(id);
  }

  @ApiOperation({ description: 'Subscribe on user' })
  @ApiParam({
    name: 'subscriptionUserId',
    required: true,
    description: 'Should be an id of user which another user want subscribe',
    type: Number
  })
  @ApiOkResponse({
    type: UserEntityWithSubscribersDto,
    description: 'Got user which another user subscribe!'
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${id}" was not found!'
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'User with id "${subscriptionUserId}" cannot subscribe to himself'
  })
  @Patch('subscribe/:subscriptionUserId')
  @UseGuards(JwtAuthGuard)
  async subscribeOnUser(
    @GetCurrentUserId() userId: number,
    @Param('subscriptionUserId', ParseIntPipe) subscriptionUserId: number
  ): Promise<ISubscribeOnUserResponseContract> {
    this.logger.log(`Try to subscribe user with id "${userId}" on user with id "${subscriptionUserId}"`)
    return await this.userService.subscribeOnUser(userId, subscriptionUserId);
  }
}
