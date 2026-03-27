// AuthController: recibe las peticiones HTTP y las delega al AuthService.
// No contiene logica de negocio, solo enruta.

import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth') // Agrupa los endpoints bajo "Auth" en Swagger
@Controller('auth') // Prefijo de ruta: /api/v1/auth
export class AuthController {
  // El constructor inyecta AuthService automaticamente (NestJS lo resuelve)
  constructor(private authService: AuthService) {}

  // POST /api/v1/auth/login
  // Recibe rut + password, devuelve JWT + datos del usuario
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion con email y contrasena' })
  @ApiResponse({ status: 200, description: 'Login exitoso, devuelve JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /api/v1/auth/register
  // Crea un usuario nuevo (para pruebas y setup inicial)
  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario nuevo' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}