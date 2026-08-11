'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { useSamples } from '../../../../hooks/useSamples';
import { useAuth } from '../../../../context/AuthContext';
import { Sample } from '../../../../types/sample.types';
import { CalendarIcon, Loader2, ClipboardEdit, AlertCircle, Eye } from 'lucide-react';

export default function PendingResultsPage() {
  const router = useRouter();
  const { samplesQuery } = useSamples();
  const { data: samples, isLoading, error } = samplesQuery;
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  const isAdmin = user?.role === 'ADMIN';

  const filteredSamples = React.useMemo(() => {
    if (!samples) return [];
    
    return samples.filter((sample) => {
      // 1. Show only active samples ready for result entry
      if (sample.status !== 'PROCESSING') return false;

      // 2. Filter by search query
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      const matchBarcode = sample.barcode?.toLowerCase().includes(query);
      const matchOrder = sample.testOrder?.orderNumber?.toLowerCase().includes(query);
      const matchPatientFirstName = sample.testOrder?.patient?.firstName.toLowerCase().includes(query);
      const matchPatientLastName = sample.testOrder?.patient?.lastName.toLowerCase().includes(query);
      const matchPatientMrn = sample.testOrder?.patient?.mrn.toLowerCase().includes(query);
      
      return matchBarcode || matchOrder || matchPatientFirstName || matchPatientLastName || matchPatientMrn;
    });
  }, [samples, searchQuery]);

  const columns = [
    {
      key: 'barcode',
      header: 'Barcode',
      cell: (row: Sample) => (
        <span className="font-mono text-sm font-medium">{row.barcode || 'N/A'}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      cell: (row: Sample) => {
        const patient = row.testOrder?.patient;
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
      cell: (row: Sample) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.orderItem?.testNameSnapshot}</span>
          <span className="text-xs text-slate-500">Order: {row.testOrder?.orderNumber}</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Processing Started',
      cell: (row: Sample) => (
        <div className="flex items-center text-sm text-slate-600">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {new Date(row.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
      ),
    },
    {
      key: 'action',
      header: '',
      cell: (row: Sample) => (
        <div className="flex justify-end">
          {isAdmin ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200">
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors cursor-pointer border border-primary-200">
              <ClipboardEdit className="w-3.5 h-3.5 mr-1.5" />
              Enter Result
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Result Queue"
        description="Samples in processing that require result entry."
        actions={
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            <ClipboardEdit className="w-4 h-4 text-primary-500" />
            Ready: {filteredSamples.length || 0}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Toolbar
          onSearch={setSearchQuery}
          searchPlaceholder="Search by patient, MRN, order, or barcode..."
        />

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-4">
              <AlertCircle className="w-12 h-12" />
              <p>Failed to load processing samples.</p>
            </div>
          ) : (
            <DataTable
              data={filteredSamples}
              columns={columns}
              onRowClick={(row) => router.push(`/dashboard/results/${row.id}`)}
              pageSize={10}
              totalCount={filteredSamples.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
