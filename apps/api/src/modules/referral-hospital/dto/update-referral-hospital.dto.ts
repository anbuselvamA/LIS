import { PartialType } from '@nestjs/swagger';
import { CreateReferralHospitalDto } from './create-referral-hospital.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReferralHospitalDto extends PartialType(CreateReferralHospitalDto) {
  @ApiPropertyOptional({ description: 'Active status of the hospital' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
