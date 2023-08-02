import {IsEnum, IsOptional, IsString} from 'class-validator';
import {GenderEnum} from "./enums/gender.enum";

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
