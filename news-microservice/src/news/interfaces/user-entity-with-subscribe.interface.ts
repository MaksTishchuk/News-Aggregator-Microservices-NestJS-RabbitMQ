import {IUserEntity} from "./user-entity.interface";

export interface IUserEntityWithSubscribe extends IUserEntity {
  subscribers: IUserEntity[]
  subscriptions: IUserEntity[]
}
