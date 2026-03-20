import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.tenantId,
      registerDto.role || 'TECNICO',
    );
    return {
      message: 'Usuario registrado exitosamente',
      user: newUser,
    };
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  validateToken(@Body() body: any) {
    return { valid: true, message: 'Token válido' };
  }
}
