import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ILike, In, Repository} from "typeorm";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";
import {RpcException} from "@nestjs/microservices";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find({order: {createdAt: 'desc'}})
  }

  async searchUsers(searchUsersDto: SearchUsersDto): Promise<UserEntity[]> {
    if (!searchUsersDto.username && !searchUsersDto.email) {
      throw new RpcException(new BadRequestException('Search fields should not be empty!'));
    }
    const users = await this.userRepository.findBy([
      { username: ILike(`%${searchUsersDto.username}%`) },
      { email: ILike(`%${searchUsersDto.email}%`) },
    ]);
    return users.map((user) => {
      delete user.password;
      return user;
    });
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {id},
      relations: ['subscribers', 'subscriptions']
    })
    if (!user) throw new RpcException(new NotFoundException('User was not found!'))
    return user
  }

  async getUserProfile(userId: number): Promise<UserEntity> {
    const profile = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.subscribers', 'subscribers')
      .leftJoin('user.subscriptions', 'subscriptions')
      .where('user.id = :id', { id: userId })
      .getOne()
    delete profile.password
    return profile
  }

  async updateUserProfile(updateUserProfileDto: UpdateUserProfileDto): Promise<UserEntity> {
    const updatedUser = await this.userRepository.createQueryBuilder()
      .update<UserEntity>(UserEntity, updateUserProfileDto)
      .where('id = :id', {id: updateUserProfileDto.id})
      .returning('*')
      .updateEntity(true)
      .execute()
    if (!updatedUser.affected) {
      throw new RpcException(new BadRequestException(`User with id "${updateUserProfileDto.id}" has not been updated!`))
    }
    delete updatedUser.raw[0].password
    return updatedUser.raw[0]
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete({ id });
    if (!result.affected) {
      throw new RpcException(new BadRequestException(`User with id ${id} was not deleted!`))
    }
    return { success: true, message: 'User has been deleted!' };
  }

  async subscribeOnUser(userId: number, subscriptionUserId: number) {
    if (userId === subscriptionUserId) {
      throw new BadRequestException(`A user cannot subscribe to himself!`);
    }
    const users = await this.userRepository.find({
      where: {id: In([userId, subscriptionUserId])},
      relations: ['subscribers', 'subscriptions']
    })
    let subscriptionUser, user
    for (const findUser of users) {
      if (findUser.id === subscriptionUserId) subscriptionUser = findUser
      else if (findUser.id === userId) user = findUser
    }
    if (!subscriptionUser) throw new NotFoundException(
      `User with id ${subscriptionUserId} was not found! Subscription failed!`
    )
    if (subscriptionUser.subscribers.find(subscriber => subscriber.id === user.id)) {
      subscriptionUser.subscribers = subscriptionUser.subscribers.filter(
        (subscriber) => subscriber.id !== user.id
      )
    } else {
      subscriptionUser.subscribers.push(user)
    }
    return await this.userRepository.save(subscriptionUser)
  }
}
