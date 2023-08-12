import {IPaginationInterface} from "./interfaces/pagination.interface";

export const getPagination = (dto: IPaginationInterface) => {
  const page = dto.page ? dto.page : 1
  const perPage = dto.perPage ? dto.perPage : 10
  const skip = (page - 1) * perPage
  return {perPage, skip}
}