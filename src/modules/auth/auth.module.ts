import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TypeormAuthUserReaderAdapter } from './adapters/typeorm-auth-user-reader.adapter';
import { BcryptPasswordHasherAdapter } from './adapters/bcrypt-password-hasher.adapter';
import { JwtTokenSignerAdapter } from './adapters/jwt-token-signer.adapter';
import {
  AUTH_USER_READER,
  PASSWORD_HASHER,
  TOKEN_SIGNER,
  LOGIN_USE_CASE,
} from './tokens';
import { LoginUseCase } from './use-cases/login.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { TenantsService } from '../tenants/tenants.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TenantsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, PasswordReset]),
    // FIX #7: Usar registerAsync para asegurar que .env fue leido primero por ConfigModule
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
    AuthService,
    JwtStrategy,
    TypeormAuthUserReaderAdapter,
    BcryptPasswordHasherAdapter,
    JwtTokenSignerAdapter,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    {
      provide: AUTH_USER_READER,
      useExisting: TypeormAuthUserReaderAdapter,
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
      useFactory: (userReader, passwordHasher, tokenSigner, tenantsService) => {
        return new LoginUseCase(
          userReader,
          passwordHasher,
          tokenSigner,
          tenantsService,
        );
      },
      inject: [AUTH_USER_READER, PASSWORD_HASHER, TOKEN_SIGNER, TenantsService],
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
