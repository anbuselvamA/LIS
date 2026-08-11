import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SampleStatus } from '@prisma/client';

export class CreateSampleDto {
  @ApiProperty({ example: 'uuid-of-test-order', description: 'The parent Test Order' })
  @IsString()
  @IsNotEmpty()
  testOrderId: string;

  @ApiProperty({ example: 'uuid-of-order-item', description: 'The specific Order Item this sample fulfills' })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiPropertyOptional({ enum: SampleStatus, description: 'Initial status of the sample' })
  @IsEnum(SampleStatus)
  @IsOptional()
  status?: SampleStatus;
}
