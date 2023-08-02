import { GenderEnum } from '../entities/enum/gender.enum';
import {IsNumber, IsOptional} from 'class-validator';

export class UpdateUserProfileDto {
  @IsNumber()
  id: number;

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
  avatar?: string;
}
