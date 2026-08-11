import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jane', description: 'The first name of the patient' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the patient' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1985-04-12T00:00:00.000Z', description: 'The Date of Birth of the patient' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE, description: 'The gender of the patient' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiPropertyOptional({ example: '+14155552671', description: 'The phone number of the patient' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com', description: 'The email address of the patient' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: true, description: 'Force create duplicate patient despite same phone number' })
  @IsOptional()
  forceCreate?: boolean;
}
