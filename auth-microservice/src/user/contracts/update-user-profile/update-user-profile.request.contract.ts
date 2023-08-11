import {GenderEnum} from "../../entities/enum/gender.enum";

export interface IUpdateUserProfileRequestContract {
  id: number
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  gender?: GenderEnum;
}
