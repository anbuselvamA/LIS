'use client';

import * as React from 'react';
import { useReferralDashboard } from '../../../../hooks/useDashboard';
import { StatCard } from '../../../../components/shared/StatCard';
import { DataTable } from '../../../../components/shared/DataTable';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Network, FileCheck, CheckSquare, Clock } from 'lucide-react';

export default function ReferralDashboardPage() {
  const { data, isLoading, error } = useReferralDashboard();

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard data</div>;

  const columns = [
    {
      key: 'referralNumber',
      header: 'Referral Number',
      cell: (row: any) => <div className="font-medium text-slate-700">{row.referralNumber}</div>,
    },
    {
      key: 'patient',
      header: 'Patient Name',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.patient?.firstName} {row.patient?.lastName}</div>
          <div className="text-xs text-slate-500">{row.patient?.gender}, {row.patient?.age}</div>
        </div>
      ),
    },
    {
      key: 'mrn',
      header: 'MRN',
      cell: (row: any) => <div className="text-slate-500 font-mono text-sm">{row.patient?.mrn}</div>,
    },
    {
      key: 'date',
      header: 'Date requested',
      cell: (row: any) => <div className="text-sm">{new Date(row.createdAt).toLocaleString()}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Referral Partner Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={data?.summary?.today?.totalReferrals || 0}
          icon={<Network className="h-4 w-4" />}
          description="Total patients referred"
        />
        <StatCard
          title="Pending Requests"
          value={data?.summary?.today?.pendingReferrals || 0}
          icon={<Clock className="h-4 w-4 text-orange-500" />}
          description="Waiting for acceptance"
        />
        <StatCard
          title="Accepted Requests"
          value={data?.summary?.today?.completedReferrals || 0}
          icon={<CheckSquare className="h-4 w-4 text-blue-600" />}
          description="Order created"
        />
        <StatCard
          title="Reports Ready"
          value={data?.summary?.today?.sharedReports || 0}
          icon={<FileCheck className="h-4 w-4 text-green-600" />}
          description="Results verified"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <div className="col-span-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Recent Referral Requests</h3>
            </div>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <DataTable
                columns={columns}
                data={data.recentActivity}
              />
            ) : (
              <div className="p-8 text-center text-slate-500">
                No referral requests yet.
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-full">
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
        </div>
      </div>
    </div>
  );
}
