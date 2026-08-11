'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '../../../../../hooks/useOrders';
import { PageHeader } from '../../../../../components/shared/PageHeader';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, TestTube2, User, Receipt, CreditCard } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return <div className="p-8">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error loading order</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
      </div>

      <PageHeader 
        title={`Order ${order.orderNumber}`} 
        description="Detailed view of patient test order and selected tests."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary-500" /> Patient Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">{order.patient?.firstName} {order.patient?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MRN</span>
                <span className="font-medium text-slate-900">{order.patient?.mrn}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-primary-500" /> Order Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant="outline">{order.orderStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-medium text-slate-900">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Items */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-primary-500" /> Selected Tests ({order.items?.length || 0})
              </h3>
            </div>
            
            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={item.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50/50">
                    <div>
                      <h4 className="font-medium text-slate-900">{item.testNameSnapshot}</h4>
                      <p className="text-xs text-slate-500 mt-1">Status: {item.status.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">${item.unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No tests found for this order.
              </div>
            )}
            
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="font-bold text-lg text-primary-700">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
