import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';
import { BarcodeModule } from '../barcode/barcode.module';

@Module({
  imports: [BarcodeModule],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
