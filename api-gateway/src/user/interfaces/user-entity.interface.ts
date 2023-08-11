import {UserRoleEnum} from "../dto/enums/user-role.enum";
import {GenderEnum} from "../dto/enums/gender.enum";

export interface IUserEntity {
  id: number
  username: string
  email: string
  password?: string
  isActivated: boolean
  role: UserRoleEnum
  firstName: string
  lastName: string
  phoneNumber: string
  country: string
  city: string
  gender: GenderEnum
  avatar: string
  createdAt: Date
  updatedAt: Date
  subscribersCount: number
  subscriptionsCount: number
}
