// update-user.dto.ts
// Campos que se pueden modificar de un usuario.
// Todos opcionales: solo mandas lo que quieras cambiar.

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'nuevo@friocheck.com', description: 'Nuevo email', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalido' })
  email?: string;

  @ApiProperty({ example: 'nuevaClave123', description: 'Nueva contrasena', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'Carlos', description: 'Nuevo nombre', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Lopez', description: 'Nuevo apellido', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+56987654321', description: 'Nuevo telefono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'DRIVER', description: 'Nuevo rol', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: false, description: 'Activar/desactivar usuario', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
