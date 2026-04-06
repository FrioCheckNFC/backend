// users.controller.ts
// Endpoints para gestionar usuarios dentro de un tenant.
// Protegidos con JWT + roles.
// El tenantId se saca del token del admin logueado.

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Listar usuarios de mi empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios del tenant' })
  findAll(@Req() req) {
    return this.usersService.findAll(req.user.tenantId);
  }

  // Ruta específica ANTES de :id para evitar conflictos
  @Get('email/:email')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Buscar usuario por email' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.usersService.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un usuario nuevo en mi empresa' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  create(@Body() dto: CreateUserDto, @Req() req) {
    return this.usersService.create(dto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
    return this.usersService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.remove(id, req.user.tenantId);
  }

  // ==========================================
  // ENDPOINTS NUEVOS DEL REPO DB
  // ==========================================

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Desactivar un usuario' })
  deactivate(@Param('id') id: string, @Req() req) {
    return this.usersService.deactivate(id, req.user.tenantId);
  }

  @Patch(':id/activate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Activar un usuario' })
  activate(@Param('id') id: string, @Req() req) {
    return this.usersService.activate(id, req.user.tenantId);
  }

  @Patch(':id/change-password')
  @Roles('ADMIN', 'SUPPORT', 'VENDOR', 'TECHNICIAN', 'DRIVER', 'RETAILER')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.usersService.changePassword(
      id,
      dto.currentPassword,
      dto.newPassword,
      req.user.tenantId,
    );
  }
}
