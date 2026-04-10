import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extraer tenant_id de request (header, body, o params)
    const tenantIdFromQuery = request.headers['x-tenant-id'] || 
                               request.query?.tenantId || 
                               request.body?.tenantId;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Usuario sin tenant_id válido');
    }

    // Si se especifica tenant_id, debe coincidir con el del usuario
    if (tenantIdFromQuery && tenantIdFromQuery !== user.tenantId) {
      throw new ForbiddenException('No tienes acceso a ese tenant');
    }

    // Asignar tenant_id al request para usar en servicios
    request.tenantId = user.tenantId;

    return true;
  }
}
