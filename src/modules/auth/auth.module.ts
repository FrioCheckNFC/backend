import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserTypeOrmEntity as User } from '../users/infrastructure/database/entities/user.typeorm.entity';
import { PasswordReset } from './infrastructure/database/entities/password-reset.entity';

import { AuthController } from './infrastructure/http/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/http/strategies/jwt.strategy';

import { TypeormAuthUserRepositoryAdapter } from './infrastructure/adapters/typeorm-auth-user-repository.adapter';
import { BcryptPasswordHasherAdapter } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import { JwtTokenSignerAdapter } from './infrastructure/adapters/jwt-token-signer.adapter';

import {
  AUTH_USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_SIGNER,
  LOGIN_USE_CASE,
} from './infrastructure/tokens';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { CheckUserUseCase } from './application/use-cases/check-user.use-case';
import { CreateSuperAdminUseCase } from './application/use-cases/create-super-admin.use-case';

import { FindTenantsUseCase } from '../tenants/application/use-cases/find-tenants.use-case';
import { TenantsModule } from '../tenants/tenants.module';

const useCases = [
  RegisterUserUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  CheckUserUseCase,
  CreateSuperAdminUseCase,
];

@Module({
  imports: [
    TenantsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, PasswordReset]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    TypeormAuthUserRepositoryAdapter,
    BcryptPasswordHasherAdapter,
    JwtTokenSignerAdapter,
    ...useCases,
    {
      provide: AUTH_USER_REPOSITORY,
      useExisting: TypeormAuthUserRepositoryAdapter,
    },
    {
      provide: PASSWORD_HASHER,
      useExisting: BcryptPasswordHasherAdapter,
    },
    {
      provide: TOKEN_SIGNER,
      useExisting: JwtTokenSignerAdapter,
    },
    {
      provide: LOGIN_USE_CASE,
      useFactory: (userRepo, passwordHasher, tokenSigner, FindTenantsUseCase) => {
        return new LoginUseCase(
          userRepo,
          passwordHasher,
          tokenSigner,
          FindTenantsUseCase,
        );
      },
      inject: [AUTH_USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SIGNER, FindTenantsUseCase],
    },
  ],
  exports: [
    JwtModule, 
    PassportModule, 
    AUTH_USER_REPOSITORY, 
    ...useCases,
    LOGIN_USE_CASE
  ],
})
export class AuthModule {}
