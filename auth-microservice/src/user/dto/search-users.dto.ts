import {IsOptional, IsString} from 'class-validator';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
