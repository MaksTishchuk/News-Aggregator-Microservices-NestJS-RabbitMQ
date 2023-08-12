import {INewsEntity} from "../../interfaces/news-entity.interface";

export interface ISearchNewsResponseContract {
  total: number
  news: INewsEntity[]
}
