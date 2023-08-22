import {IsEnum, IsOptional, IsString} from 'class-validator';
import {GenderEnum} from "./enums/gender.enum";
import {ApiPropertyOptional} from "@nestjs/swagger";
import {File} from 'multer'

export class UpdateUserProfileDto {

  @ApiPropertyOptional({
    description: 'First Name',
    example: 'Maks',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last Name',
    example: 'Tishchuk',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone Number',
    example: '0991234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Ukraine',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Kyiv',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Gender - only Unselected, Male, Female',
    example: 'Male',
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
