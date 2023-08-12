import {IPaginationInterface} from "../../../common/interfaces/pagination.interface";

export interface ISearchNewsRequestContract extends IPaginationInterface{
  title?: string;
  body?: string;
}