'use client';

import * as React from 'react';
import { useDoctorDashboard } from '../../../../hooks/useDashboard';
import { StatCard } from '../../../../components/shared/StatCard';
import { TablePlaceholder } from '../../../../components/shared/TablePlaceholder';
import { ClipboardCheck, AlertTriangle, CheckCircle2, FileText, XCircle } from 'lucide-react';

export default function DoctorDashboardPage() {
  const { data, isLoading, error } = useDoctorDashboard();

  if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 animate-spin text-slate-400 border-4 border-t-primary-500 border-slate-200 rounded-full" /></div>;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-slate-900">Unable to load Doctor Dashboard</h2>
        <p className="text-slate-500 mb-6 max-w-md">The system encountered an error while fetching the verification metrics. Please check your connection or try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Internal Doctor Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Verification"
          value={data?.summary?.today?.pendingVerifications || 0}
          icon={<ClipboardCheck className="h-4 w-4" />}
          description="Results needing approval"
        />
        <StatCard
          title="Rejected Results"
          value={data?.summary?.today?.rejectedResults || 0}
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          description="Results returned for recheck"
        />
        <StatCard
          title="Verified Today"
          value={data?.summary?.today?.verifiedToday || 0}
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          description="Approved in last 24h"
        />
        <StatCard
          title="Reports Ready"
          value={data?.summary?.today?.reportsReady || 0}
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          description="Ready for printing/download"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <TablePlaceholder
            title="Recent Results Awaiting Verification"
            columns={['Sample', 'Patient', 'Entry Date', 'Action']}
            data={data?.recentActivity?.map((res: any) => ({
              sample: res?.sample?.barcode || '-',
              patient: res?.sample?.testOrder?.patient?.firstName 
                ? `${res.sample.testOrder.patient.firstName} ${res.sample.testOrder.patient.lastName}` 
                : 'Unknown Patient',
              'entry date': res?.createdAt ? new Date(res.createdAt).toLocaleDateString() : '-',
              action: (
                <button 
                  onClick={() => window.location.href = `/dashboard/doctor/results/${res.sampleId}`}
                  className="text-xs font-medium text-primary-600 hover:text-primary-800"
                >
                  Review Result
                </button>
              )
            })) || []}
          />
        </div>
        <div className="col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Notifications</h3>
            <div className="space-y-4">
              {data?.notifications?.map((notif: string, i: number) => (
                <div key={i} className="flex items-start gap-4 text-sm">
                  <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <p className="text-gray-600">{notif}</p>
                </div>
              )) || <p className="text-sm text-gray-500">No new notifications.</p>}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center items-center h-48 space-y-4">
             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
               <ClipboardCheck className="h-6 w-6 text-primary-600" />
             </div>
             <div className="text-center">
               <h3 className="text-sm font-semibold text-gray-900">Start Verification</h3>
               <p className="text-xs text-gray-500 mt-1">Review pending laboratory results</p>
             </div>
             <button
               onClick={() => window.location.href = '/dashboard/doctor/results'}
               className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 bg-primary-600 text-white hover:bg-primary-700 h-9 px-4 py-2"
             >
               Go to Queue
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
