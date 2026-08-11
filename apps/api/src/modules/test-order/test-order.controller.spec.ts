import { Test, TestingModule } from '@nestjs/testing';
import { TestOrderController } from './test-order.controller';

describe('TestOrderController', () => {
  let controller: TestOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestOrderController],
    }).compile();

    controller = module.get<TestOrderController>(TestOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
