import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {ILike, Repository} from "typeorm";
import {SearchUsersDto} from "./dto/search-users.dto";
import {UpdateUserProfileDto} from "./dto/update-user-profile.dto";

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
      throw new NotFoundException('Search fields should not be empty!');
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
    const user = await this.userRepository.findOne({where: {id}})
    if (!user) throw new NotFoundException('User was not found!')
    return user
  }

  async getUserProfile(user: UserEntity): Promise<UserEntity> {
    const profile = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: user.id })
      .getOne();
    delete profile.password;
    return profile;
  }

  async updateUserProfile(user: UserEntity, updateUserProfileDto: UpdateUserProfileDto): Promise<UserEntity> {
    const findUser = await this.getUserById(user.id)
    const updatedUser = await this.userRepository.update(
      {id: findUser.id},
      {
        ...updateUserProfileDto,
      }
    )
    if (!updatedUser.affected) {
      throw new NotFoundException(`User with id "${user.id}" has not been updated!`)
    }
    return await this.getUserById(user.id)
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`User with id ${id} was not deleted!`);
    }
    return { success: true, message: 'User has been deleted!' };
  }
}
