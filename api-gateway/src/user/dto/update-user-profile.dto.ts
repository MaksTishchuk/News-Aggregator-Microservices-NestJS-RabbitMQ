import {IsOptional} from 'class-validator';
import {GenderEnum} from "./enums/gender.enum";

export class UpdateUserProfileDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  gender?: GenderEnum;

  @IsOptional()
  avatar?: any
}
