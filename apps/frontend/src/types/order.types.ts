import { z } from 'zod';
import { Patient } from './patient.types';
import { AuthUser } from './auth.types';

export type OrderStatus = 'REGISTERED' | 'PARTIALLY_PROCESSED' | 'COMPLETED' | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'PROCESSING' | 'RESULT_ENTERED' | 'APPROVED' | 'REPORTED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  testOrderId: string;
  testId: string;
  testNameSnapshot: string;
  unitPrice: number;
  status: OrderItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patient?: Patient;
  referringDoctorId?: string;
  referringDoctor?: AuthUser;
  referralRequestId?: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const createOrderItemSchema = z.object({
  testId: z.string().min(1, 'Test ID is required'),
});

export const createTestOrderSchema = z.object({
  orderNumber: z.string().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  referringDoctorId: z.string().optional(),
  referralRequestId: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, 'At least one test must be selected'),
});

export type CreateTestOrderFormData = z.infer<typeof createTestOrderSchema>;
