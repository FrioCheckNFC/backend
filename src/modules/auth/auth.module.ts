import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

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
  // JwtStrategy debe estar en providers para que Passport la encuentre
  providers: [AuthService, JwtStrategy],
  // Exportamos para que otros modulos puedan usar JwtAuthGuard y AuthService
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
