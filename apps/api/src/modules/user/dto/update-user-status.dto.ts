import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: true,
    description: 'Whether the user is active (true) or deactivated (false)',
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
