import { Module } from '@nestjs/common';
import { TestOrderService } from './test-order.service';
import { TestOrderController } from './test-order.controller';
import { BarcodeModule } from '../barcode/barcode.module';

@Module({
  imports: [BarcodeModule],
  providers: [TestOrderService],
  controllers: [TestOrderController]
})
export class TestOrderModule {}
