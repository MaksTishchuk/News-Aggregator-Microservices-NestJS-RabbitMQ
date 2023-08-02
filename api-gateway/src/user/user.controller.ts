import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe, Patch,
  Post,
  Put,
  Query, Res, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import {UserService} from "./user.service";
import {SearchUsersDto} from "./dto/search-users.dto";
import {Auth} from "../auth/decorators/auth.decorator";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AdminRoleGuard} from "./guards/admin-role.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import { Response } from 'express'

@Controller('users')
export class UserController {

  private readonly logger = new Logger(UserController.name)

  constructor(private userService: UserService) {}

  @Get('')
  async getAllUsers() {
    this.logger.log(`Try to get all users`)
    return await this.userService.getAllUsers();
  }

  @Get('search')
  searchUsers(@Query() searchUsersDto: SearchUsersDto) {
    this.logger.log(`Try to search users`)
    return this.userService.searchUsers(searchUsersDto);
  }

  @Get('profile')
  @Auth()
  async getUserProfile(@GetCurrentUserId() id: number) {
    this.logger.log(`Try to get user profile`)
    return await this.userService.getUserProfile(id);
  }

  @Put('profile')
  @Auth()
  async updateUserProfile(@GetCurrentUserId() id: number, @Body() dto: UpdateUserProfileDto) {
    this.logger.log(`Try to update user profile`)
    return await this.userService.updateUserProfile(id, dto);
  }

  @Get(':userId/avatar')
  async getUserAvatar(@Res() res: Response, @Param('userId', ParseIntPipe) id: number) {
    this.logger.log(`Try to update user avatar`)
    try {
      const response = await this.userService.getUserAvatar(id);
      if (response) {
        res.redirect(response)
      } else {
        res.status(404).send('Avatar not found');
      }
    } catch (error) {
      res.status(500).send(`Internal server error: ${error}`)
    }

  }

  @Patch('profile/avatar')
  @Auth()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(@GetCurrentUserId() id: number, @UploadedFile() avatar: any) {
    this.logger.log(`Try to update user avatar`)
    return await this.userService.updateUserAvatar(id, avatar);
  }

  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) id: number) {
    this.logger.log(`Try to get user by id`)
    return await this.userService.getUserById(id);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async deleteUser(@Param('userId', ParseIntPipe) id: number) {
    this.logger.log(`Try to admin delete user by id`)
    return await this.userService.deleteUser(id);
  }

  @Patch('subscribe/:subscriptionUserId')
  @Auth()
  async subscribeOnUser(
    @GetCurrentUserId() userId: number,
    @Param('subscriptionUserId', ParseIntPipe) subscriptionUserId: number
  ) {
    this.logger.log(`Try to get user by id`)
    return await this.userService.subscribeOnUser(userId, subscriptionUserId);
  }
}
