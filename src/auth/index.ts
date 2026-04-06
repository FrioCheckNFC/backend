// Barrel export - re-exporta todo desde modules/auth
// Esto mantiene compatibilidad con las importaciones existentes en src/*
export * from '../modules/auth/guards/jwt-auth.guard';
export * from '../modules/auth/guards/roles.guard';
export * from '../modules/auth/guards/tenant.guard';
export * from '../modules/auth/decorators/require-roles.decorator';
export * from '../modules/auth/decorators/roles.decorator';
export * from '../modules/auth/decorators/current-user.decorator';
export * from '../modules/auth/decorators/current-tenant.decorator';
export * from '../modules/auth/jwt.strategy';
export * from '../modules/auth/auth.module';
export * from '../modules/auth/auth.service';
export * from '../modules/auth/auth.controller';
export * from '../modules/auth/tokens';
export * from '../modules/auth/adapters/jwt-token-signer.adapter';
export * from '../modules/auth/adapters/bcrypt-password-hasher.adapter';
export * from '../modules/auth/adapters/typeorm-auth-user-reader.adapter';
