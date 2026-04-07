import { ApiProperty } from '@nestjs/swagger';
<<<<<<< Updated upstream
import { IsNotEmpty, IsString } from 'class-validator';

const VALID_ROLES = [
  'ADMIN',
  'SUPPORT',
  'VENDOR',
  'RETAILER',
  'TECHNICIAN',
  'DRIVER',
] as const;
=======
import { IsNotEmpty, IsIn, IsArray, ArrayMinSize } from 'class-validator';
>>>>>>> Stashed changes

export class AddRoleDto {
  @ApiProperty({
    example: ['VENDOR', 'DRIVER'],
    description:
<<<<<<< Updated upstream
      'Rol a agregar: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER',
    enum: VALID_ROLES,
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsString()
  role: string;
}
=======
      'Roles a agregar: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER',
    isArray: true,
    enum: ['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER'], { each: true, message: 'Rol inválido' })
  role: string[];
}
>>>>>>> Stashed changes
