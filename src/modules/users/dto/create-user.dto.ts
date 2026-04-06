// create-user.dto.ts
// Datos necesarios para crear un usuario nuevo.
// Solo ADMIN deberia poder crear usuarios (asignarlos a su tenant).

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

const VALID_ROLES = [
  'ADMIN',
  'SUPPORT',
  'VENDOR',
  'RETAILER',
  'TECHNICIAN',
  'DRIVER',
] as const;

export class CreateUserDto {
  @ApiProperty({
    example: 'tecnico@friocheck.com',
    description: 'Email unico del usuario',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({
    example: 'miClave123',
    description: 'Contrasena (se hashea antes de guardar)',
  })
  @IsNotEmpty({ message: 'La contrasena es obligatoria' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Perez', description: 'Apellido del usuario' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Telefono (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: ['TECHNICIAN', 'VENDOR'],
    description:
      'Roles: array de ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  role?: string[];

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del tenant al que pertenece',
  })
  @IsNotEmpty()
  @IsUUID()
  tenantId: string;
}
