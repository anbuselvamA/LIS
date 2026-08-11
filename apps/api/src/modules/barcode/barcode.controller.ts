import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { BarcodeService } from './barcode.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Barcodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('barcodes')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Get(':sampleId')
  @ApiOperation({ summary: 'Retrieve barcode details for a sample' })
  @ApiResponse({ status: 200, description: 'Barcode details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Sample not found.' })
  getBarcode(@Param('sampleId') sampleId: string) {
    return this.barcodeService.getBarcodeBySampleId(sampleId);
  }

  @Get(':sampleId/image')
  @ApiOperation({ summary: 'Retrieve the generated PNG barcode image' })
  @ApiProduces('image/png')
  @ApiResponse({ status: 200, description: 'Barcode image returned successfully.' })
  @ApiResponse({ status: 404, description: 'Sample or barcode image not found.' })
  async getBarcodeImage(@Param('sampleId') sampleId: string, @Res() res: Response) {
    const filePath = await this.barcodeService.getBarcodeImagePath(sampleId);
    return res.sendFile(filePath);
  }
}
