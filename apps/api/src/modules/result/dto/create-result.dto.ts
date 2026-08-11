import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { EntryMode, AbnormalFlag } from '@prisma/client';

export class CreateResultDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  sampleId: string;

  @ApiProperty({ example: 'RBC' })
  @IsString()
  @IsNotEmpty()
  parameterCode: string;

  @ApiProperty({ example: 'Red Blood Cells' })
  @IsString()
  @IsNotEmpty()
  parameterName: string;

  @ApiProperty({ example: '4.5' })
  @IsString()
  @IsNotEmpty()
  resultValue: string;

  @ApiPropertyOptional({ example: 'millions/mcL' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: '4.2 - 5.4' })
  @IsString()
  @IsOptional()
  referenceRange?: string;

  @ApiPropertyOptional({ enum: AbnormalFlag, example: AbnormalFlag.NORMAL })
  @IsOptional()
  @IsEnum(AbnormalFlag)
  abnormalFlag?: AbnormalFlag;

  @ApiPropertyOptional({ example: 'Normal RBC count.' })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiPropertyOptional({ enum: EntryMode, example: EntryMode.MANUAL })
  @IsOptional()
  @IsEnum(EntryMode)
  entryMode?: EntryMode;

  @ApiPropertyOptional({ example: 'Machine recalibrated' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
