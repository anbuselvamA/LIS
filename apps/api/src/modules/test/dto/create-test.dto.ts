import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecimenType, ContainerType } from '@prisma/client';

export class CreateTestDto {
  @ApiProperty({ example: 'CBC', description: 'The unique code for the test' })
  @IsString()
  @IsNotEmpty()
  testCode: string;

  @ApiProperty({ example: 'Complete Blood Count', description: 'The formal medical name of the test' })
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiPropertyOptional({ example: 'Measures all types of blood cells', description: 'Clinical explanation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: SpecimenType, example: SpecimenType.BLOOD, description: 'The biological material needed' })
  @IsEnum(SpecimenType)
  @IsNotEmpty()
  specimenType: SpecimenType;

  @ApiProperty({ enum: ContainerType, example: ContainerType.EDTA_LAVENDER, description: 'The container to draw the sample into' })
  @IsEnum(ContainerType)
  @IsNotEmpty()
  containerType: ContainerType;

  @ApiProperty({ example: false, description: 'Whether the patient needs to fast' })
  @IsBoolean()
  @IsOptional()
  fastingRequired?: boolean;

  @ApiProperty({ example: 4, description: 'Hours from sample receipt to report generation' })
  @IsNumber()
  @IsNotEmpty()
  turnaroundTimeHours: number;

  @ApiProperty({ example: 450.00, description: 'Standard billing price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
