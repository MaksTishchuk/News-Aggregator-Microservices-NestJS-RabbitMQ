import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {UserRoleEnum} from "../dto/enums/user-role.enum";

@Injectable()
export class AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    if (request?.user) return request.user['role'] === UserRoleEnum.ADMIN
    return false
  }
}
