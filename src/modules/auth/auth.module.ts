import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
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
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';

@Module({
  imports: [
    // Habilita Passport con estrategia JWT por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Da acceso al repositorio de la tabla users dentro de este modulo
    TypeOrmModule.forFeature([User]),

    // Configura JWT: el secret viene del .env, los tokens expiran en 24 horas
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TypeormAuthUserReaderAdapter,
    BcryptPasswordHasherAdapter,
    JwtTokenSignerAdapter,
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
      useFactory: (userReader, passwordHasher, tokenSigner) => {
        return new LoginUseCase(userReader, passwordHasher, tokenSigner);
      },
      inject: [AUTH_USER_READER, PASSWORD_HASHER, TOKEN_SIGNER],
    },
  ],
  // Exportamos para que otros modulos puedan usar JwtAuthGuard y AuthService
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
