import {LogTypeEnum} from "../../../common/enums/log-type.enum";
import {IPaginationInterface} from "../../../common/interfaces/pagination.interface";

export interface IGetAllLogsRequestContract extends IPaginationInterface {
  type?: LogTypeEnum
}