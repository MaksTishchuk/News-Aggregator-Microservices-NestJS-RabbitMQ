import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query, UseGuards
} from '@nestjs/common';
import {UserService} from "./user.service";
import {SearchUsersDto} from "./dto/search-users.dto";
import {Auth} from "../auth/decorators/auth.decorator";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {AdminRoleGuard} from "./guards/admin-role.guard";

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
}
