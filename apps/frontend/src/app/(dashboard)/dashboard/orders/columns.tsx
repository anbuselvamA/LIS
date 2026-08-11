import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { TestOrder } from '../../../../types/order.types';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Eye, Receipt } from 'lucide-react';
import Link from 'next/link';

export const getColumns = (): ColumnDef<TestOrder>[] => [
  {
    key: 'orderNumber',
    header: 'Order #',
    cell: (order) => (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-gray-900">{order.orderNumber}</span>
      </div>
    ),
  },
  {
    key: 'patient',
    header: 'Patient Name',
    cell: (order) => (
      <span className="font-medium text-gray-900">
        {order.patient?.firstName} {order.patient?.lastName}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Order Date',
    cell: (order) => {
      const date = new Date(order.createdAt);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
  },
  {
    key: 'items',
    header: 'Tests',
    cell: (order) => {
      // API returns items array (findOne) or _count (findAll)
      const testCount = order.items?.length || (order as any)._count?.items || 0;
      const testLabel = testCount === 1 ? 'Test' : 'Tests';
      
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {testCount} {testLabel}
        </Badge>
      );
    },
  },
  {
    key: 'totalAmount',
    header: 'Total',
    cell: (order) => {
      return <span className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</span>;
    },
  },
  {
    key: 'orderStatus',
    header: 'Status',
    cell: (order) => {
      const status = order.orderStatus;
      let badgeColor = 'bg-gray-100 text-gray-700';
      
      if (status === 'REGISTERED') badgeColor = 'bg-amber-100 text-amber-700 border-amber-200';
      if (status === 'PARTIALLY_PROCESSED') badgeColor = 'bg-blue-100 text-blue-700 border-blue-200';
      if (status === 'COMPLETED') badgeColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (status === 'CANCELLED') badgeColor = 'bg-red-100 text-red-700 border-red-200';

      return (
        <Badge className={badgeColor} variant="outline">
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (order) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/orders/${order.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  }
];
