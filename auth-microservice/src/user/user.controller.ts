import {Controller, Logger} from '@nestjs/common';
import {UserService} from "./user.service";
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
import {AckErrors} from "../utils/ack-errors";
import {PaginationDto} from "../utils/dto/pagination.dto";
import {
  IGetAllUsersResponseContract, IGetUserByIdResponseContract, IGetUserProfileResponseContract,
  ISearchUsersRequestContract, ISubscribeOnUserRequestContract, ISubscribeOnUserResponseContract,
  IUpdateUserAvatarRequestContract, IUpdateUserAvatarResponseContract,
  IUpdateUserProfileRequestContract, IUpdateUserProfileResponseContract
} from "./contracts";

@Controller()
export class UserController {

  private logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  @MessagePattern('get-all-users')
  async getAllUsers(
    @Payload() request: PaginationDto, @Ctx() context: RmqContext
  ): Promise<IGetAllUsersResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get users`)
      return await this.userService.getAllUsers(request);
    } finally {
      this.logger.log(`GetAllUsers: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('user-subscriptions')
  async getUserSubscriptions(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user subscriptions ids`)
      return await this.userService.getUserSubscriptions(id);
    } finally {
      this.logger.log(`GetUserSubscriptions: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('search-users')
  async searchUsers(
    @Payload() request: ISearchUsersRequestContract, @Ctx() context: RmqContext
  ): Promise<IGetAllUsersResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to search users`)
      return await this.userService.searchUsers(request);
    } finally {
      this.logger.log(`SearchUsers: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-users-by-ids')
  async getUsersByIds(@Payload() ids: [], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get users by ids`)
      return await this.userService.getUsersByIds(ids);
    } finally {
      this.logger.log(`GetUsersByIds: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-user-by-id')
  async getUserById(
    @Payload() id: number, @Ctx() context: RmqContext
  ): Promise<IGetUserByIdResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user`)
      return await this.userService.getUserById(id);
    } finally {
      this.logger.log(`GetUserById: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-short-user-info-by-id')
  async getShortUserInfoById(@Payload() id: number, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get short user info`)
      return await this.userService.getShortUserInfoById(id);
    } finally {
      this.logger.log(`GetShortUserInfoById: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-user-profile')
  async getUserProfile(
    @Payload() id: number, @Ctx() context: RmqContext
  ): Promise<IGetUserProfileResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user profile`)
      return await this.userService.getUserProfile(id);
    } finally {
      this.logger.log(`GetUserProfile: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-user-profile')
  async updateProfile(
    @Payload() request: IUpdateUserProfileRequestContract, @Ctx() context: RmqContext
  ): Promise<IUpdateUserProfileResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update user profile`)
      return await this.userService.updateUserProfile(request);
    } finally {
      this.logger.log(`UpdateProfile: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-user-avatar')
  async getUserAvatar(@Payload() id: number, @Ctx() context: RmqContext): Promise<string> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to get user avatar`)
      return await this.userService.getUserAvatar(id);
    } finally {
      this.logger.log(`GetUserAvatar: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('update-user-avatar')
  async updateUserAvatar(
    @Payload() request: IUpdateUserAvatarRequestContract, @Ctx() context: RmqContext
  ): Promise<IUpdateUserAvatarResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to update user avatar`)
      return await this.userService.updateUserAvatar(request);
    } finally {
      this.logger.log(`UpdateUserAvatar: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('delete-user')
  async deleteUser(@Payload() id: number, @Ctx() context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to delete user`)
      await this.userService.deleteUser(id)
      await channel.ack(originalMessage)
      this.logger.log(`DeleteUser: Acknowledge message success`)
    } catch (error) {
      this.logger.error(`Error: ${JSON.stringify(error)}`);
      if (AckErrors.hasAckErrors(error.message)) {
        await channel.ack(originalMessage)
        this.logger.log(`DeleteUser: Acknowledge message success`)
      }
    }
  }

  @MessagePattern('subscribe-on-user')
  async subscribeOnUser(
    @Payload() request: ISubscribeOnUserRequestContract, @Ctx() context: RmqContext
  ): Promise<ISubscribeOnUserResponseContract> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`Try to subscribe on user`)
      return await this.userService.subscribeOnUser(request.userId, request.subscriptionUserId);
    } finally {
      this.logger.log(`SubscribeOnUser: Acknowledge message success`)
      await channel.ack(originalMessage);
    }
  }
}
