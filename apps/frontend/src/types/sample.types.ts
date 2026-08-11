export type SampleStatus = 'PENDING' | 'COLLECTED' | 'IN_TRANSIT' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

import { OrderItem, TestOrder } from './order.types';

export interface Sample {
  id: string;
  barcode: string;
  sampleNumber: string;
  testOrderId: string;
  testOrder?: TestOrder;
  orderItemId: string;
  orderItem?: OrderItem;
  events?: any[];
  status: SampleStatus;
  createdAt: string;
  updatedAt: string;
}
