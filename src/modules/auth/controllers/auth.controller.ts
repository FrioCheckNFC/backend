// AuthController: recibe las peticiones HTTP y las delega al AuthService.
// No contiene logica de negocio, solo enruta.

import { Body, Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesion con email/RUT y contrasena' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(@Body() dto: LoginDto) {
    const identifier = dto.email || dto.rut;
    if (!identifier) {
      throw new Error('El email o RUT es obligatorio');
    }
    return this.authService.login(identifier, dto.password);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un usuario nuevo (requiere rol ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperacion de contrasena' })
  @ApiResponse({
    status: 200,
    description: 'Si el email existe, se enviara un enlace de recuperacion',
  })
  @ApiResponse({ status: 400, description: 'Token invalido o expirado' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contrasena con token' })
  @ApiResponse({
    status: 200,
    description: 'Contrasena actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Token invalido o expirado' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('check-user/:identifier')
  @ApiOperation({ summary: 'Verificar si un usuario existe (por email o RUT)' })
  @ApiResponse({ status: 200, description: 'Usuario existe' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  checkUser(@Param('identifier') identifier: string) {
    return this.authService.checkUser(identifier);
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar si un JWT sigue vigente' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  validateToken() {
    return { valid: true, message: 'Token válido' };
  }
}
