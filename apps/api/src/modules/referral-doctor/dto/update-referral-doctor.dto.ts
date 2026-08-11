import { PartialType } from '@nestjs/swagger';
import { CreateReferralDoctorDto } from './create-referral-doctor.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReferralDoctorDto extends PartialType(CreateReferralDoctorDto) {
  @ApiPropertyOptional({ description: 'Active status of the doctor' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
