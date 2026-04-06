import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'miClaveActual123',
    description: 'Contraseña actual del usuario',
  })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'nuevaClave456',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
