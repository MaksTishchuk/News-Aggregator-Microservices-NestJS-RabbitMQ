import {UserEntityDto} from "./user-entity.dto";

export class UserEntityWithSubscribersDto extends UserEntityDto {
  subscribers: UserEntityDto[]
  subscriptions: UserEntityDto[]
}