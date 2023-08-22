import {RegisterResponseType} from "../types/register.response.type";
import {UserResponse} from "../types/login.response.type";

export class AuthResponseDto implements RegisterResponseType {
  accessToken: string;
  user: UserResponseDto
}

class UserResponseDto implements UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}