'use client';

import * as React from 'react';
import { useLabDashboard } from '../../../../hooks/useDashboard';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { StatCard } from '../../../../components/shared/StatCard';
import { useRouter } from 'next/navigation';
import { TestTube2, Inbox, Activity, Loader2, CheckCircle2, ArrowRight, Database, Clock } from 'lucide-react';

export default function LabDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useLabDashboard();
  const recentSamples = data?.recentActivity ?? [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load dashboard data.</div>;
  }

  interface LabStats {
    pendingSamples?: number;
    collectedSamples?: number;
    receivedSamples?: number;
    samplesInProcessing?: number;
    todaysCollections?: number;
    pendingResults?: number;
    resultsEnteredToday?: number;
    completedResults?: number;
  }
  const stats: LabStats = data?.summary?.today ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory Operations"
        description="Monitor sample processing and analytical workflows."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Pending Samples"
          value={stats.pendingSamples ?? 0}
          icon={<Clock className="h-4 w-4 text-slate-500" />}
          description="Awaiting collection"
        />
        <StatCard
          title="Collected Today"
          value={stats.todaysCollections ?? 0}
          icon={<TestTube2 className="h-4 w-4 text-purple-500" />}
          description="Samples collected"
        />
        <StatCard
          title="Processing Samples"
          value={stats.samplesInProcessing ?? 0}
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          description="In analysis"
        />
        <StatCard
          title="Pending Result Entry"
          value={stats.pendingResults ?? 0}
          icon={<Inbox className="h-4 w-4 text-amber-500" />}
          description="Awaiting entry"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedResults ?? 0}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          description="Results entered"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Samples processing list */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Live Sample Queue</h3>
            <button
              onClick={() => router.push('/dashboard/samples')}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View all samples <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {recentSamples.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <TestTube2 className="h-12 w-12 mb-4 opacity-40" />
              <p className="text-sm font-medium">No sample activity yet</p>
              <p className="text-xs mt-1">Samples will appear here once orders are processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {recentSamples.map((sample: any) => (
                <div
                  key={sample.id}
                  onClick={() => router.push(`/dashboard/samples/${sample.id}`)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <TestTube2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 font-mono">{sample.barcode}</p>
                      <p className="text-xs text-slate-500">
                        {sample.testOrder?.patient?.firstName} {sample.testOrder?.patient?.lastName}
                        {sample.testOrder?.patient?.mrn ? ` · ${sample.testOrder.patient.mrn}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${sample.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
                      ${sample.status === 'COLLECTED' ? 'bg-blue-100 text-blue-800' : ''}
                      ${sample.status === 'RECEIVED' ? 'bg-purple-100 text-purple-800' : ''}
                      ${sample.status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800' : ''}
                      ${sample.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                    `}>
                      {sample.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(sample.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Laboratory Activity Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Lab Activity Feed</h3>
          </div>
          <div className="p-6 h-[500px] overflow-y-auto">
            <div className="relative border-l border-slate-200 ml-3 space-y-8">
              {recentSamples.length > 0 ? recentSamples.map((item: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-3.5 mt-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white bg-slate-100 border-slate-200`}>
                    <Activity className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 mb-1 block">{new Date(item.updatedAt).toLocaleTimeString()}</span>
                    <h4 className="text-sm font-bold text-slate-900">Sample {item.status}</h4>
                    <p className="text-sm text-slate-600 mt-1">Barcode {item.barcode} is now {item.status.toLowerCase()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 ml-6">No recent lab activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
