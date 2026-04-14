import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateSuperAdminDto {
  @ApiProperty({
    example: 'admin@friocheck.com',
    description: 'Email del SUPER_ADMIN',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: 'MiPassword123',
    description: 'Contraseña (mínimo 8 caracteres)',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Nombre',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Super',
    description: 'Apellido',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;
}