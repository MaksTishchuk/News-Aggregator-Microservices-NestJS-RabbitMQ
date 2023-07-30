import { GenderEnum } from '../entities/enum/gender.enum';
import { IsOptional } from 'class-validator';

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
