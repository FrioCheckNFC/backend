import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Obtener roles del usuario (role es array ahora)
    const userRoles: string[] = Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);

    // Verificar si el usuario tiene ALGUNO de los roles requeridos
    const hasRole = userRoles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Usuario requiere uno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
