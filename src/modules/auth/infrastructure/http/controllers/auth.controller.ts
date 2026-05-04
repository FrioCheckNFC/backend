// AuthController: recibe las peticiones HTTP y las delega a los Use Cases.

import { Body, Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CreateSuperAdminDto } from '../dto/create-super-admin.dto';

import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/reset-password.use-case';
import { CheckUserUseCase } from '../../../application/use-cases/check-user.use-case';
import { CreateSuperAdminUseCase } from '../../../application/use-cases/create-super-admin.use-case';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../decorators/roles.decorator';
import { LOGIN_USE_CASE } from '../../tokens';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly checkUserUseCase: CheckUserUseCase,
    private readonly createSuperAdminUseCase: CreateSuperAdminUseCase,
  ) {}

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
    return this.loginUseCase.execute(identifier, dto.password);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un usuario nuevo (requiere rol ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  register(@Body() dto: RegisterDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperacion de contrasena' })
  @ApiResponse({
    status: 200,
    description: 'Si el email existe, se enviara un enlace de recuperacion',
  })
  @ApiResponse({ status: 400, description: 'Token invalido o expirado' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contrasena con token' })
  @ApiResponse({
    status: 200,
    description: 'Contrasena actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Token invalido o expirado' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(dto.token, dto.newPassword);
  }

  @Get('check-user/:identifier')
  @ApiOperation({ summary: 'Verificar si un usuario existe (por email o RUT)' })
  @ApiResponse({ status: 200, description: 'Usuario existe' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado' })
  checkUser(@Param('identifier') identifier: string) {
    return this.checkUserUseCase.execute(identifier);
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

  @Post('create-super-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear SUPER_ADMIN (solo para primera setup)' })
  @ApiResponse({ status: 201, description: 'SUPER_ADMIN creado' })
  @ApiResponse({ status: 403, description: 'Ya existe un SUPER_ADMIN' })
  createSuperAdmin(@Body() dto: CreateSuperAdminDto) {
    return this.createSuperAdminUseCase.execute(dto);
  }
}
