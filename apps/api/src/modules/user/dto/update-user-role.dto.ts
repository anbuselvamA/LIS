import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'LAB_TECHNICIAN',
    description: 'The new role for the user',
    enum: Role
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
