import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Permission } from '../../context/auth/domain/enum/permission.enum';
import { RolePermissions } from '../../context/auth/domain/role-permissions';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../context/auth/domain/enum/role.enum';

interface RequestWithUser extends Request {
  user?: {
    userId: number;
    role: Role;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found in token.');
    }

    const userPermissions = RolePermissions[user.role] || [];

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Missing required permission: ${requiredPermissions.join(' or ')}`,
      );
    }

    return true;
  }
}
