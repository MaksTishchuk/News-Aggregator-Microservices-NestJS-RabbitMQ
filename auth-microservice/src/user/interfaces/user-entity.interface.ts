import {UserRoleEnum} from "../entities/enum/user-role.enum";
import {GenderEnum} from "../entities/enum/gender.enum";

export interface IUserEntity {
  id: number
  username: string
  email: string
  password: string
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
