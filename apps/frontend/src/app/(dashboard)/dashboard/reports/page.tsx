'use client';

import * as React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Toolbar } from '@/components/shared/Toolbar';
import { DataTable } from '@/components/shared/DataTable';
import { useResults } from '@/hooks/useResults';
import { Result } from '@/types/result.types';
import { Printer, Download, FileText, Loader2, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function ReadyReportsPage() {
  const { readyResultsQuery, markReportViewed } = useResults();
  const [searchTerm, setSearchTerm] = React.useState('');

  const isLoading = readyResultsQuery.isLoading;
  const orders = readyResultsQuery.data || [];

  const filteredData = React.useMemo(() => {
    return orders.filter((order: any) => {
      const p = order.patient;
      const searchStr = `${p?.firstName} ${p?.lastName} ${p?.mrn} ${order.orderNumber}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [orders, searchTerm]);

  const columns = [
    {
      key: 'patient',
      header: 'Patient Name',
      cell: (row: any) => {
        const p = row.patient;
        return (
          <div>
            <div className="font-semibold text-slate-900">{p?.firstName} {p?.lastName}</div>
            <div className="text-xs text-slate-500">MRN: {p?.mrn}</div>
          </div>
        );
      },
    },
    {
      key: 'order',
      header: 'Order Info',
      cell: (row: any) => {
        const tests = row.items?.map((i: any) => i.testNameSnapshot).join(', ') || 'Unknown';
        return (
          <div>
            <div className="font-medium text-slate-900">{row.orderNumber}</div>
            <div className="text-xs text-slate-500 truncate max-w-[200px]" title={tests}>{tests}</div>
          </div>
        );
      },
    },
    {
      key: 'tat',
      header: 'Turnaround Time (TAT)',
      cell: (row: any) => {
        const createdTime = new Date(row.createdAt);
        
        let maxVerifiedTime: Date | null = null;
        row.items?.forEach((item: any) => {
          item.sample?.results?.forEach((res: any) => {
             if (res.verifiedAt) {
               const vTime = new Date(res.verifiedAt);
               if (!maxVerifiedTime || vTime > maxVerifiedTime) maxVerifiedTime = vTime;
             }
          });
        });

        if (!maxVerifiedTime) return <span className="text-slate-400">-</span>;
        
        const diffMs = (maxVerifiedTime as any) - (createdTime as any);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return (
          <div className="text-sm text-slate-600">
            {hours}h {mins}m
          </div>
        );
      },
    },
    {
      key: 'verifiedAt',
      header: 'Report Ready At',
      cell: (row: any) => {
        let maxVerifiedTime: Date | null = null;
        row.items?.forEach((item: any) => {
          item.sample?.results?.forEach((res: any) => {
             if (res.verifiedAt) {
               const vTime = new Date(res.verifiedAt);
               if (!maxVerifiedTime || vTime > maxVerifiedTime) maxVerifiedTime = vTime;
             }
          });
        });

        return (
          <div className="text-sm text-slate-600">
            {maxVerifiedTime ? (maxVerifiedTime as Date).toLocaleString() : '-'}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <StatusBadge status="VERIFIED" />
          {row.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              NEW
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: any) => {
        const handleOpen = async (action: 'view' | 'print' | 'pdf') => {
          let url = `/report/order/${row.id}`;
          if (action === 'print' || action === 'pdf') url += '?print=true';
          
          const newWindow = window.open(url, '_blank');
          
          if (newWindow && row.isNew) {
            try {
              await markReportViewed.mutateAsync(row.id);
            } catch (err) {
              console.error("Failed to mark as viewed", err);
            }
          }
        };

        return (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOpen('view')}
              className="flex items-center text-slate-600 hover:bg-slate-50"
              title="View Report"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOpen('print')}
              className="flex items-center text-primary-600 border-primary-200 hover:bg-primary-50"
              title="Print Report"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOpen('pdf')}
              className="flex items-center text-slate-600 hover:bg-slate-50"
              title="Save as PDF"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Ready Reports" 
      />

      <Toolbar 
        onSearch={setSearchTerm}
        searchPlaceholder="Search by MRN, Name, or Barcode..."
      />

      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredData} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
