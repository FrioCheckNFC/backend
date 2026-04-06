// Require roles decorator - alternativa al Roles decorator
import { SetMetadata } from '@nestjs/common';

export const RequireRoles = (...roles: string[]) => SetMetadata('roles', roles);
