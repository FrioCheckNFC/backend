import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, BadRequestException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { RequireRoles } from './decorators/require-roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const loginIdentifier = loginDto.identifier ?? loginDto.email ?? loginDto.rut;

    if (!loginIdentifier) {
      throw new BadRequestException('Debe enviar identifier (RUT o email)');
    }

    const user = await this.authService.validateUser(loginIdentifier, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @RequireRoles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.tenantId,
      registerDto.role || 'TECHNICIAN',
    );
    return {
      message: 'Usuario registrado exitosamente',
      user: newUser,
    };
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  validateToken() {
    return { valid: true, message: 'Token válido' };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
