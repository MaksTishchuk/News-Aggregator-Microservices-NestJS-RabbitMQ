import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {UserRoleEnum} from "../dto/enums/user-role.enum";

@Injectable()
export class AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    if (request?.user) {
      if (request.user['role'] === UserRoleEnum.ADMIN) return true
      throw new UnauthorizedException('User without Admin role can`t make this request!')
    }
    return false
  }
}
