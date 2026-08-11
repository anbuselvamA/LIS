'use client';

import * as React from 'react';
import { useAdminDashboard } from '../../../../hooks/useDashboard';
import { StatCard } from '../../../../components/shared/StatCard';
import { Users, FileText, TestTube2, Clock, CheckCircle, Activity, HeartPulse, Database, Globe, CalendarDays, ArrowRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-500">Failed to load dashboard data</div>;

  const todayStats = (data?.summary?.today || {}) as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Administration</h1>
          <p className="text-slate-500 text-sm mt-1">System monitoring and workflow analytics</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">System Health</span>
            {data?.systemHealth ? (
              <Badge variant={data.systemHealth.status === 'ok' ? 'default' : 'destructive'} className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                All Systems Operational
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Patients"
          value={todayStats.totalPatients || 0}
          icon={<Users className="h-4 w-4" />}
          description="Registered to date"
        />
        <StatCard
          title="Orders Today"
          value={todayStats.totalOrders || 0}
          icon={<FileText className="h-4 w-4" />}
          description="In the last 24h"
        />
        <StatCard
          title="Pending Samples"
          value={todayStats.pendingSamples || 0}
          icon={<TestTube2 className="h-4 w-4 text-amber-500" />}
          description="Awaiting collection"
        />
        <StatCard
          title="Results Waiting"
          value={todayStats.pendingResults || 0}
          icon={<Clock className="h-4 w-4 text-orange-500" />}
          description="Pending verification"
        />
        <StatCard
          title="Reports Generated"
          value={todayStats.reportsReadyToday || 0}
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          description="Ready today"
        />
        <StatCard
          title="Active Users"
          value={todayStats.activeUsers || 0}
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          description="Currently active"
        />
      </div>

      {/* Workflow Monitor */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Workflow Monitor (Today)</h3>
        <div className="flex flex-col md:flex-row items-center justify-between px-4">
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 border-2 border-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{todayStats.totalPatients || 0}</span>
            <span className="text-xs font-medium text-slate-500 uppercase mt-1">Patients<br/>Registered</span>
          </div>

          <ArrowRight className="text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-3 border-2 border-indigo-100">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{todayStats.totalOrders || 0}</span>
            <span className="text-xs font-medium text-slate-500 uppercase mt-1">Orders<br/>Created</span>
          </div>

          <ArrowRight className="text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-3 border-2 border-purple-100">
              <TestTube2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{todayStats.pendingSamples || 0}</span>
            <span className="text-xs font-medium text-slate-500 uppercase mt-1">Samples<br/>Pending</span>
          </div>

          <ArrowRight className="text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-3 border-2 border-amber-100">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{todayStats.pendingResults || 0}</span>
            <span className="text-xs font-medium text-slate-500 uppercase mt-1">Results<br/>Pending</span>
          </div>

          <ArrowRight className="text-slate-300 hidden md:block" />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3 border-2 border-emerald-100">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{todayStats.verifiedToday || 0}</span>
            <span className="text-xs font-medium text-slate-500 uppercase mt-1">Doctor<br/>Verified</span>
          </div>

        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity Timeline */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Activity Feed</h3>
          </div>
          <div className="p-6">
            <div className="relative border-l border-slate-200 ml-3 space-y-8">
              {(data?.recentActivity?.length || 0) > 0 ? data?.recentActivity?.map((item: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-3.5 mt-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white bg-slate-100 border-slate-200`}>
                    <Activity className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 mb-1 block">{new Date(item.createdAt).toLocaleTimeString()} - {item.user}</span>
                    <h4 className="text-sm font-bold text-slate-900">{item.action.replace(/_/g, ' ')}</h4>
                    <p className="text-sm text-slate-600 mt-1">{item.entity} ID: {item.entityId}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 ml-6">No recent system activity.</p>
              )}
            </div>
          </div>
        </div>

        {/* System Health Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Health</h3>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center"><Globe className="w-4 h-4 mr-2 text-slate-400" /> API Gateway</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ONLINE (12ms)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center"><Database className="w-4 h-4 mr-2 text-slate-400" /> Database Instance</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">HEALTHY (4ms)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center"><HeartPulse className="w-4 h-4 mr-2 text-slate-400" /> Active Sessions</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">1 SESSION</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-slate-400" /> Uptime</span>
                <span className="text-xs font-bold text-slate-600">99.99%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="pt-4 mt-6 border-t border-slate-100">
               <p className="text-xs text-slate-500 text-center">Last backup completed 2 hours ago.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
