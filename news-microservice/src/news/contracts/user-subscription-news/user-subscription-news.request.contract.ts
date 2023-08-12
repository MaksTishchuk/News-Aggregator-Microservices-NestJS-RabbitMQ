import {IPaginationInterface} from "../../../common/interfaces/pagination.interface";

export interface IUserSubscriptionNewsRequestContract {
  authorIds: number[]
  pagination: IPaginationInterface
}