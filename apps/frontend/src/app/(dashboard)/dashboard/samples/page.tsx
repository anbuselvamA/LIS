'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { useSamples } from '../../../../hooks/useSamples';
import { Sample } from '../../../../types/sample.types';
import { CalendarIcon, Loader2, TestTube2, AlertCircle } from 'lucide-react';

type Tab = 'PENDING' | 'COLLECTED' | 'RECEIVED' | 'PROCESSING';

export default function SamplesPage() {
  const router = useRouter();
  const { samplesQuery } = useSamples();
  const { data: samples, isLoading, error } = samplesQuery;
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<Tab>('PENDING');

  const filteredSamples = React.useMemo(() => {
    if (!samples) return [];
    
    return samples.filter((sample) => {
      // 1. Filter by active tab (status)
      if (sample.status !== activeTab) return false;

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
  }, [samples, searchQuery, activeTab]);

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
      header: 'Patient Name',
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
      key: 'createdAt',
      header: 'Date',
      cell: (row: Sample) => (
        <div className="flex items-center text-sm text-slate-600">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {new Date(row.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Sample) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${row.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
          ${row.status === 'COLLECTED' ? 'bg-blue-100 text-blue-800' : ''}
          ${row.status === 'RECEIVED' ? 'bg-purple-100 text-purple-800' : ''}
          ${row.status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800' : ''}
          ${row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
          ${row.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {row.status.toLowerCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample Management"
        description="Manage laboratory samples, collection workflows, and accessioning."
        actions={
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            <TestTube2 className="w-4 h-4 text-primary-500" />
            Total: {samples?.length || 0}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50">
          <nav className="flex -mb-px px-6 space-x-8 overflow-x-auto" aria-label="Tabs">
            {(['PENDING', 'COLLECTED', 'RECEIVED', 'PROCESSING'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-semibold
                  ${activeTab === tab ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-700'}
                `}>
                  {samples?.filter(s => s.status === tab).length || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>

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
              <p>Failed to load samples. Please try again.</p>
            </div>
          ) : (
            <DataTable
              data={filteredSamples}
              columns={columns}
              onRowClick={(row) => router.push(`/dashboard/samples/${row.id}`)}
              pageSize={10}
              totalCount={filteredSamples.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
