import {IsOptional, IsString} from 'class-validator';
import {ApiPropertyOptional} from "@nestjs/swagger";

export class SearchUsersDto {

  @ApiPropertyOptional({
    description: 'Search by Username',
    example: 'Maks',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Search by Email',
    example: 'Maks@gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
