import { GenderEnum } from '../entities/enum/gender.enum';
import {IsEnum, IsNumber, IsOptional} from 'class-validator';

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
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @IsOptional()
  avatar?: string;
}
