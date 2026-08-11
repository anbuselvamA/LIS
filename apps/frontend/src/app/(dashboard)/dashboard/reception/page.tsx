'use client';

import * as React from 'react';
import { useReceptionDashboard } from '../../../../hooks/useDashboard';
import { StatCard } from '../../../../components/shared/StatCard';
import { TablePlaceholder } from '../../../../components/shared/TablePlaceholder';
import { Users, UserPlus, Network, FileText } from 'lucide-react';

export default function ReceptionDashboardPage() {
  const { data, isLoading, error } = useReceptionDashboard();

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard data</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reception Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Registrations"
          value={data?.summary?.today?.todaysRegistrations || 0}
          icon={<UserPlus className="h-4 w-4" />}
          description="Total new patients today"
        />
        <StatCard
          title="Walk-in Patients"
          value={data?.summary?.today?.walkInPatients || 0}
          icon={<Users className="h-4 w-4" />}
          description="Direct walk-ins"
        />
        <StatCard
          title="Referral Patients"
          value={data?.summary?.today?.referralPatients || 0}
          icon={<Network className="h-4 w-4" />}
          description="From external doctors"
        />
        <StatCard
          title="Pending Registrations"
          value={data?.summary?.today?.pendingRegistrations || 0}
          icon={<FileText className="h-4 w-4 text-orange-500" />}
          description="Draft or incomplete"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <TablePlaceholder
            title="Recent Orders"
            columns={['Order ID', 'Patient Name', 'Date']}
            data={data?.recentActivity?.map((act: any) => ({
              'order id': act.orderNumber,
              'patient name': act.patient?.firstName ? `${act.patient.firstName} ${act.patient.lastName}` : 'Unknown',
              'date': new Date(act.createdAt).toLocaleDateString(),
            })) || []}
          />
        </div>
        <div className="col-span-3">
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
        </div>
      </div>
    </div>
  );
}
