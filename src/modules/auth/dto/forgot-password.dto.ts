import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@friocheck.com',
    description: 'Email del usuario',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;
}
