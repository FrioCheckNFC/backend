// Tenant guard - verifica que el usuario tenga un tenant válido
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar que el usuario tenga un tenantId
    return !!(user && user.tenantId);
  }
}
