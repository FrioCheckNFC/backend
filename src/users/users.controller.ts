import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AddRoleDto, SetRolesDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RequireRoles } from '../auth/decorators/require-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto, @CurrentTenant() tenantId: string) {
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get()
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  findAll(@CurrentTenant() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  // Specific routes BEFORE generic :id
  @Get('email/:email')
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ==========================================
  // ENDPOINTS DE ROLES
  // ==========================================

  @Get(':id/roles')
  @RequireRoles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Post(':id/roles')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  addRole(@Param('id') id: string, @Body() addRoleDto: AddRoleDto) {
    return this.usersService.addRole(id, addRoleDto.role);
  }

  @Delete(':id/roles/:role')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRole(@Param('id') id: string, @Param('role') role: string) {
    return this.usersService.removeRole(id, role);
  }

  @Patch(':id/roles')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  setRoles(@Param('id') id: string, @Body() setRolesDto: SetRolesDto) {
    return this.usersService.setRoles(id, setRolesDto.roles);
  }
}
