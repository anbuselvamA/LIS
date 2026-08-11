import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferralStatus } from '@prisma/client';

export class CreateReferralRequestDto {

  @ApiPropertyOptional({ description: 'Existing patient ID if already registered' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Array of Test IDs requested' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requestedTestIds?: string[];

  @ApiPropertyOptional({ description: 'Priority of the referral (e.g., ROUTINE, URGENT, STAT)' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Clinical reason for referral' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Any notes for the referral' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'User ID who created the referral request' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Patient details for new patient registration' })
  @IsOptional()
  patientDetails?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email?: string;
    address?: string;
  };
}

export class UpdateReferralRequestStatusDto {
  @ApiProperty({ description: 'The new status of the referral', enum: ReferralStatus })
  @IsEnum(ReferralStatus)
  status: ReferralStatus;
  
  @ApiPropertyOptional({ description: 'User ID who shared the report, required if status is REPORT_SHARED' })
  @IsOptional()
  @IsString()
  sharedBy?: string;
}
