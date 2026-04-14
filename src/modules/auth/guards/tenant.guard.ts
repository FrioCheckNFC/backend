import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.role && user.role.includes('SUPER_ADMIN')) {
      return true;
    }

    const tenantIdFromQuery = request.headers['x-tenant-id'] || 
                               request.query?.tenantId || 
                               request.body?.tenantId;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Usuario sin tenant_id válido');
    }

    if (tenantIdFromQuery && tenantIdFromQuery !== user.tenantId) {
      throw new ForbiddenException('No tienes acceso a ese tenant');
    }

    request.tenantId = user.tenantId;

    return true;
  }
}
