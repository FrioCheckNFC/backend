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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FindUsersUseCase } from '../../../application/use-cases/find-users.use-case';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../../../application/use-cases/remove-user.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { TenantGuard } from '../../../../auth/infrastructure/http/guards/tenant.guard';
import { Roles } from '../../../../auth/infrastructure/http/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class UsersController {
  constructor(
    private readonly findUsersUseCase: FindUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Get()
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Listar usuarios de mi empresa' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios del tenant' })
  findAll(@Req() req) {
    return this.findUsersUseCase.findAll(req.user.tenantId);
  }

  @Get('email/:email')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Buscar usuario por email' })
  findByEmail(@Param('email') email: string) {
    return this.findUsersUseCase.findByEmail(email);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.findUsersUseCase.findOne(id, req.user.tenantId);
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un usuario nuevo en mi empresa' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  create(@Body() dto: CreateUserDto, @Req() req) {
    return this.createUserUseCase.execute(dto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
    return this.updateUserUseCase.execute(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  remove(@Param('id') id: string, @Req() req) {
    return this.removeUserUseCase.execute(id, req.user.tenantId);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Desactivar un usuario' })
  deactivate(@Param('id') id: string, @Req() req) {
    return this.updateUserUseCase.setActivation(id, false, req.user.tenantId);
  }

  @Patch(':id/activate')
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Activar un usuario' })
  activate(@Param('id') id: string, @Req() req) {
    return this.updateUserUseCase.setActivation(id, true, req.user.tenantId);
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
    return this.changePasswordUseCase.execute(
      id,
      dto.currentPassword,
      dto.newPassword,
      req.user.tenantId,
    );
  }
}
