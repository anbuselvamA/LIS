import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bwipjs from 'bwip-js';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BarcodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAndSaveBarcode(barcodeValue: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'uploads', 'barcodes', `${barcodeValue}.png`);
    
    // Check if the directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    await fs.promises.writeFile(filePath, pngBuffer);
    
    return filePath;
  }

  async getBarcodeBySampleId(sampleId: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId },
      select: { barcode: true }
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    // Build the URL to preview the barcode image
    // In a real app, this might come from env, but we'll use a relative API path
    const imageUrl = `/barcodes/${sampleId}/image`;
    
    return {
      sampleId,
      barcodeValue: sample.barcode,
      imageUrl
    };
  }

  async getBarcodeImagePath(sampleId: string): Promise<string> {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId },
      select: { barcode: true }
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'barcodes', `${sample.barcode}.png`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Barcode image not found on disk');
    }

    return filePath;
  }
}
