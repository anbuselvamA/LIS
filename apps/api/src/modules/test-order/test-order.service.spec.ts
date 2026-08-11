import { Test, TestingModule } from '@nestjs/testing';
import { TestOrderService } from './test-order.service';

describe('TestOrderService', () => {
  let service: TestOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestOrderService],
    }).compile();

    service = module.get<TestOrderService>(TestOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
