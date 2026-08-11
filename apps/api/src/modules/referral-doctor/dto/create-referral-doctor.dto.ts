import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReferralDoctorDto {
  @ApiPropertyOptional({ description: 'The code of the doctor (auto-generated)' })
  @IsOptional()
  @IsString()
  doctorCode?: string;

  @ApiProperty({ description: 'The first name of the doctor' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the doctor' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Specialization of the doctor' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ description: 'The phone number of the doctor' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The user ID associated with this profile' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The ID of the associated referral hospital' })
  @IsString()
  hospitalId: string;
}
