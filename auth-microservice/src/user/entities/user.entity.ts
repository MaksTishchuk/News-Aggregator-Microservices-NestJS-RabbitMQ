import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  RelationCount
} from 'typeorm';
import { UserRoleEnum } from './enum/user-role.enum';
import { GenderEnum } from './enum/gender.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ comment: 'The user unique identifier' })
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.MEMBER })
  role: UserRoleEnum;

  @Column({ default: '' })
  firstName: string;

  @Column({ default: '' })
  lastName: string;

  @Column({ default: '' })
  phoneNumber: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: '' })
  city: string;

  @Column({ type: 'enum', enum: GenderEnum, default: GenderEnum.UNSELECTED })
  gender: GenderEnum;

  @Column({ default: '' })
  avatar: string;

  @ManyToMany((type) => UserEntity, (user) => user.following)
  @JoinTable()
  followers: UserEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.followers)
  following: UserEntity[];

  @RelationCount((user: UserEntity) => user.followers)
  followersCount: number;

  @RelationCount((user: UserEntity) => user.following)
  followingCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
