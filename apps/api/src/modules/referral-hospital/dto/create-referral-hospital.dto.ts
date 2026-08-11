import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReferralHospitalDto {
  @ApiProperty({ description: 'The code of the hospital' })
  @IsString()
  hospitalCode: string;

  @ApiProperty({ description: 'The name of the hospital' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'The address of the hospital' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'The contact email of the hospital' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'The contact phone of the hospital' })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
