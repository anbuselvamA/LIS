'use client';

import * as React from 'react';
import { useReferrals } from '../../../../hooks/useReferrals';
import { DataTable } from '../../../../components/shared/DataTable';
import { StatusBadge } from '../../../../components/shared/StatusBadge';
import { Button } from '../../../../components/ui/button';
import { Network, Plus, FileText, Eye, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../../components/ui/empty-state';

export default function ReferralsPage() {
  const { getReferrals, updateReferralStatus } = useReferrals();
  const router = useRouter();
  const [selectedReferral, setSelectedReferral] = React.useState<any | null>(null);

  if (getReferrals.isLoading) {
    return <div className="p-8">Loading referral requests...</div>;
  }

  if (getReferrals.isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Unable to load referral requests.</p>
        <Button onClick={() => getReferrals.refetch()}>Retry</Button>
      </div>
    );
  }

  const referrals = getReferrals.data || [];

  if (referrals.length === 0) {
    return (
      <EmptyState
        icon={Network}
        title="No Referral Requests"
        description="There are currently no active referral requests in the system."
      />
    );
  }

  const handleReject = () => {
    if (confirm('Are you sure you want to reject this referral request?')) {
      updateReferralStatus.mutate({ id: selectedReferral.id, data: { status: 'REJECTED' } }, {
        onSuccess: () => {
          setSelectedReferral(null);
        }
      });
    }
  };

  const columns = [
    {
      key: 'referralNumber',
      accessorKey: 'referralNumber',
      header: 'Request ID',
      cell: (row: any) => <div className="font-medium text-slate-700">{row.referralNumber}</div>,
    },
    {
      key: 'patient',
      accessorKey: 'patient',
      header: 'Patient',
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
      key: 'referralDoctor',
      accessorKey: 'referralDoctor',
      header: 'Referral Doctor',
      cell: (row: any) => {
        const doc = row.referralDoctor;
        return (
          <div>
            <div className="font-medium">{doc?.firstName} {doc?.lastName}</div>
            <div className="text-xs text-slate-500">{doc?.clinicName}</div>
          </div>
        );
      },
    },
    {
      key: 'requestedTests',
      accessorKey: 'requestedTests',
      header: 'Requested Tests',
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
      key: 'priority',
      accessorKey: 'priority',
      header: 'Priority',
      cell: (row: any) => {
        const p = row.priority;
        return (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            p === 'STAT' ? 'bg-red-100 text-red-700' :
            p === 'URGENT' ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {p}
          </span>
        );
      },
    },
    {
      key: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedReferral(row)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Referral Requests Queue</h1>
          <p className="text-sm text-slate-500">Manage incoming B2B laboratory referral requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={referrals}
        />
      </div>

      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Referral Request Details</h2>
                <p className="text-sm text-gray-500">ID: {selectedReferral.referralNumber}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReferral(null)}>Close</Button>
            </div>
            
            <div className="p-6 space-y-8 flex-1">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Referral Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Referral Number:</span> <span className="font-medium">{selectedReferral.referralNumber}</span></div>
                  <div><span className="text-gray-500">Request Date / Time:</span> <span className="font-medium">{new Date(selectedReferral.createdAt).toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Status:</span> <StatusBadge status={selectedReferral.status} /></div>
                  <div>
                    <span className="text-gray-500">Referral Doctor:</span> 
                    <span className="font-medium block">{selectedReferral.referralDoctor?.firstName} {selectedReferral.referralDoctor?.lastName}</span>
                  </div>
                  <div><span className="text-gray-500">Referral Doctor Code:</span> <span className="font-medium">{selectedReferral.referralDoctor?.doctorCode}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Patient Name:</span> <span className="font-medium">{selectedReferral.patient?.firstName} {selectedReferral.patient?.lastName}</span></div>
                  <div><span className="text-gray-500">MRN:</span> <span className="font-medium">{selectedReferral.patient?.mrn}</span></div>
                  <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{new Date(selectedReferral.patient?.dateOfBirth).toLocaleDateString()}</span></div>
                  <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{selectedReferral.patient?.gender}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedReferral.patient?.phone || 'N/A'}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Requested Tests</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedReferral.requestedTests?.map((test: any) => (
                    <div key={test.id} className="bg-gray-50 p-2 rounded flex justify-between text-sm">
                      <span className="font-medium">{test.testName}</span>
                      <span className="text-gray-500 font-mono">{test.testCode}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Clinical Information</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-500">Priority:</span> <span className="font-medium ml-2">{selectedReferral.priority}</span></div>
                  <div><span className="text-gray-500 block mb-1">Reason for Referral:</span> <p className="bg-gray-50 p-3 rounded">{selectedReferral.reason || 'None provided'}</p></div>
                  <div><span className="text-gray-500 block mb-1">Clinical Notes:</span> <p className="bg-gray-50 p-3 rounded">{selectedReferral.notes || 'None provided'}</p></div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 sticky bottom-0">
              <Button variant="destructive" onClick={handleReject} disabled={selectedReferral.status !== 'NEW' && selectedReferral.status !== 'PATIENT_REGISTERED'}>
                Reject
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={selectedReferral.status === 'REJECTED' || selectedReferral.status === 'ORDER_CREATED'}
                onClick={() => router.push(`/dashboard/orders/new?referralId=${selectedReferral.id}`)}
              >
                Accept & Create Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
