'use client';

import * as React from 'react';
import { useReferrals } from '../../../../../hooks/useReferrals';
import { DataTable } from '../../../../../components/shared/DataTable';
import { StatusBadge } from '../../../../../components/shared/StatusBadge';
import { Button } from '../../../../../components/ui/button';
import { FileText, Eye, Printer, Download, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../../../components/ui/empty-state';

export default function MyReportsPage() {
  const { getReferrals } = useReferrals();
  const router = useRouter();

  if (getReferrals.isLoading) {
    return <div className="p-8">Loading reports...</div>;
  }

  if (getReferrals.isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Unable to load reports.</p>
        <Button onClick={() => getReferrals.refetch()}>Retry</Button>
      </div>
    );
  }

  // Only show referrals where reports are ready or shared
  const readyReferrals = (getReferrals.data || []).filter((r: any) => 
    r.status === 'RESULT_READY' || r.status === 'REPORT_SHARED' || r.status === 'CLOSED'
  );

  if (readyReferrals.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Reports Available"
        description="There are currently no verified reports available for your patients."
      />
    );
  }

  const columns = [
    {
      key: 'patient',
      accessorKey: 'patient',
      header: 'Patient Name',
      cell: (row: any) => {
        const p = row.patient;
        return (
          <div>
            <div className="font-medium">{p?.firstName} {p?.lastName}</div>
            <div className="text-xs text-slate-500">MRN: {p?.mrn}</div>
          </div>
        );
      },
    },
    {
      key: 'referralNumber',
      accessorKey: 'referralNumber',
      header: 'Referral ID',
      cell: (row: any) => <div className="font-medium text-slate-700">{row.referralNumber}</div>,
    },
    {
      key: 'testOrder',
      accessorKey: 'testOrder',
      header: 'Order Number',
      cell: (row: any) => <div className="text-sm">{row.testOrder?.orderNumber || '-'}</div>,
    },
    {
      key: 'requestedTests',
      accessorKey: 'requestedTests',
      header: 'Tests',
      cell: (row: any) => {
        const tests = row.requestedTests || [];
        return (
          <div className="flex gap-1 flex-wrap">
            {tests.map((t: any) => (
              <span key={t.id} className="text-xs bg-slate-100 px-2 py-0.5 rounded">{t.testCode}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Requested At',
      cell: (row: any) => <div className="text-sm">{new Date(row.createdAt).toLocaleString()}</div>,
    },
    {
      key: 'reportReadyAt',
      accessorKey: 'testOrder',
      header: 'Report Ready At',
      cell: (row: any) => {
        // Find the latest result entry time or order update time as a proxy for report ready
        const order = row.testOrder;
        const readyDate = order ? new Date(order.updatedAt).toLocaleString() : '-';
        return <div className="text-sm">{readyDate}</div>;
      },
    },
    {
      key: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (row: any) => {
        return <StatusBadge status={row.status} />;
      },
    },
    {
      key: 'actions',
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.testOrder && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/report/order/${row.testOrder.id}`)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/report/order/${row.testOrder.id}?print=true`)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/report/order/${row.testOrder.id}?pdf=true`)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500">Access verified laboratory reports for your patients.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={readyReferrals}
        />
      </div>
    </div>
  );
}
