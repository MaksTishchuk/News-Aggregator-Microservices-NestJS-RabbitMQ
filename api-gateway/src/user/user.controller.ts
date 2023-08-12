import {
  Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Put, Query, Res, UploadedFile,
  UseGuards, UseInterceptors
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

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name)
  private clientLogger = this.clientProxyRMQ.getClientProxyLoggerInstance()

  constructor(private userService: UserService, private clientProxyRMQ: ClientProxyRMQ) {}

  @Get('')
  async getAllUsers(@Query() paginationDto: PaginationDto): Promise<IGetAllUsersResponseContract> {
    this.logger.log(`Try to get all users`)
    return await this.userService.getAllUsers(paginationDto);
  }

  @Get('search')
  searchUsers(@Query() searchUsersDto: SearchUsersDto): Promise<ISearchUsersResponseContract> {
    this.logger.log(`Try to search users`)
    return this.userService.searchUsers(searchUsersDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@GetCurrentUserId() id: number): Promise<IGetUserProfileResponseContract> {
    this.logger.log(`Try to get user profile`)
    return await this.userService.getUserProfile(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @GetCurrentUserId() id: number, @Body() dto: UpdateUserProfileDto
  ): Promise<IUpdateUserProfileResponseContract> {
    this.logger.log(`Try to update user profile`)
    return await this.userService.updateUserProfile(id, dto);
  }

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

  @Patch('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @GetCurrentUserId() id: number, @UploadedFile() avatar: File
  ): Promise<IUpdateUserAvatarResponseContract> {
    this.logger.log(`Try to update user avatar`)
    return await this.userService.updateUserAvatar(id, avatar);
  }

  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) id: number): Promise<IGetUserByIdResponseContract> {
    this.logger.log(`Try to get user by id`)
    return await this.userService.getUserById(id);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async deleteUser(@Param('userId', ParseIntPipe) id: number): Promise<void> {
    this.logger.log(`Try to admin delete user with id ${id}`)
    const payload: LoggerDto = makeLoggerPayload(LogTypeEnum.action, `Try to admin delete user with id ${id}`)
    this.clientLogger.emit('create-log', payload)
    await this.userService.deleteUser(id);
  }

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
