import {Body, Controller, Get, Logger, Param, ParseIntPipe, Post, Query} from '@nestjs/common';
import {UserService} from "./user.service";
import {SearchUsersDto} from "./dto/search-users.dto";
import {Auth} from "../auth/decorators/auth.decorator";
import {GetCurrentUserId} from "../auth/decorators/get-current-user-id.decorator";
import {GetUser} from "../auth/decorators/get-user.decorator";

@Controller('users')
export class UserController {

  private readonly logger = new Logger(UserController.name)

  constructor(private userService: UserService) {}

  @Get('')
  async getAllUsers(@GetCurrentUserId() id: number) {
    this.logger.log(`Try to get all users`)
    return await this.userService.getAllUsers();
  }

  @Get('/search')
  searchUsers(@Query() searchUsersDto: SearchUsersDto, @GetUser() user) {
    this.logger.log(`Try to search users`)
    return this.userService.searchUsers(searchUsersDto);
  }

  @Get(':userId')
  async getUserById(@Param('userId', ParseIntPipe) id: number) {
    this.logger.log(`Try to get user by id`)
    return await this.userService.getUserById(id);
  }
}
