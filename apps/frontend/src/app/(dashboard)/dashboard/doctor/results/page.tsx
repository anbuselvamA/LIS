'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Toolbar } from '@/components/shared/Toolbar';
import { DataTable } from '@/components/shared/DataTable';
import { useResults } from '@/hooks/useResults';
import { Result } from '@/types/result.types';
import { CalendarIcon, Loader2, ClipboardCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DoctorVerificationQueuePage() {
  const router = useRouter();
  const { pendingResultsQuery } = useResults();
  const { data: results, isLoading, error } = pendingResultsQuery;
  
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    
    // For the queue, we group results by sample since a doctor verifies a whole sample at once.
    // Actually, the requirements say "/dashboard/doctor/results" fetches results waiting for doctor verification.
    // We should display unique samples that have pending results.
    const samplesMap = new Map<string, Result>();
    results.forEach(res => {
      if (!samplesMap.has(res.sampleId)) {
        samplesMap.set(res.sampleId, res);
      } else {
        // If this result is critical, let's keep it as the representative one to show the critical badge
        if (res.abnormalFlag === 'CRITICAL_HIGH' || res.abnormalFlag === 'CRITICAL_LOW') {
          samplesMap.set(res.sampleId, res);
        }
      }
    });
    
    const uniqueSamples = Array.from(samplesMap.values());

    return uniqueSamples.filter((res) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      const matchBarcode = res.sample?.barcode?.toLowerCase().includes(query);
      const matchOrder = res.sample?.testOrder?.orderNumber?.toLowerCase().includes(query);
      const matchPatientFirstName = res.sample?.testOrder?.patient?.firstName.toLowerCase().includes(query);
      const matchPatientLastName = res.sample?.testOrder?.patient?.lastName.toLowerCase().includes(query);
      const matchPatientMrn = res.sample?.testOrder?.patient?.mrn.toLowerCase().includes(query);
      
      return matchBarcode || matchOrder || matchPatientFirstName || matchPatientLastName || matchPatientMrn;
    });
  }, [results, searchQuery]);

  const columns = [
    {
      key: 'barcode',
      header: 'Sample Barcode',
      cell: (row: Result) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{row.sample?.barcode || 'N/A'}</span>
          {(row.abnormalFlag === 'CRITICAL_HIGH' || row.abnormalFlag === 'CRITICAL_LOW') && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Patient Details',
      cell: (row: Result) => {
        const patient = row.sample?.testOrder?.patient;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{patient?.firstName} {patient?.lastName}</span>
            <span className="text-xs text-slate-500">{patient?.mrn}</span>
          </div>
        );
      },
    },
    {
      key: 'test',
      header: 'Test Info',
      cell: (row: Result) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.sample?.orderItem?.testNameSnapshot}</span>
          <span className="text-xs text-slate-500">Order: {row.sample?.testOrder?.orderNumber}</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Entry Date',
      cell: (row: Result) => (
        <div className="flex items-center text-sm text-slate-600">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {new Date(row.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Result) => (
        <StatusBadge status={row.resultStatus} />
      ),
    },
    {
      key: 'action',
      header: '',
      cell: (row: Result) => (
        <div className="flex justify-end">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer border border-primary-200">
            <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
            Verify
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Verification Queue"
        description="Review and approve entered laboratory results."
        actions={
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            <ClipboardCheck className="w-4 h-4 text-primary-500" />
            Pending: {filteredResults.length || 0}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Toolbar
          onSearch={setSearchQuery}
          searchPlaceholder="Search by MRN, Patient Name, Barcode or Order Number..."
        />

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-4">
              <AlertCircle className="w-12 h-12" />
              <p>Failed to load verification queue.</p>
            </div>
          ) : (
            <DataTable
              data={filteredResults}
              columns={columns}
              onRowClick={(row) => router.push(`/dashboard/doctor/results/${row.sampleId}`)}
              pageSize={10}
              totalCount={filteredResults.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
