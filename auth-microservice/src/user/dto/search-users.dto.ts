import { IsOptional } from 'class-validator';

export class SearchUsersDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;
}
