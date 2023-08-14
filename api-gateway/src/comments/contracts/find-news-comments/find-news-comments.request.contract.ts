import {IPaginationInterface} from "../../../common/interfaces/pagination.interface";

export interface IFindNewsCommentsRequestContract {
  newsId: number
  dto: IPaginationInterface
}