// AuthController: recibe las peticiones HTTP y las delega al AuthService.
// No contiene logica de negocio, solo enruta.

import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion con email y contrasena' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario nuevo' })
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
}
