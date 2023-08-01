import {Controller, Logger} from '@nestjs/common';
import {UserService} from "./user.service";
import {Ctx, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";

@Controller()
export class UserController {

  private logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  @MessagePattern('get-all-users')
  async getOrderById(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get users`)
      const users = await this.userService.getAllUsers();
      return users
    } finally {
      this.logger.log(`Get all users success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('search-users')
  async searchUsers(@Payload() dto: SearchUsersDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to search users`)
      const users = await this.userService.searchUsers(dto);
      return users
    } finally {
      this.logger.log(`Search users success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-user-by-id')
  async getUserById(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user`)
      const user = await this.userService.getUserById(id);
      return user;
    } finally {
      this.logger.log(`Get user success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-user-profile')
  async getUserProfile(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user profile`)
      const user = await this.userService.getUserProfile(id);
      return user;
    } finally {
      this.logger.log(`Get user profile success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-user-profile')
  async updateProfile(@Payload() dto: UpdateUserProfileDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update user profile`)
      const user = await this.userService.updateUserProfile(dto);
      return user
    } finally {
      this.logger.log(`Update user profile success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('delete-user')
  async deleteUser(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete user`)
      const user = await this.userService.deleteUser(id);
      return user;
    } finally {
      this.logger.log(`Delete user success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('subscribe-on-user')
  async subscribeOnUser(@Payload() payload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to subscribe on user`)
      const user = await this.userService.subscribeOnUser(payload.userId, payload.subscriptionUserId);
      return user;
    } finally {
      this.logger.log(`Subscribe on user success`)
      await channel.ack(originalMessage);
    }
  }
}
