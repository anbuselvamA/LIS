'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { useSample } from '@/hooks/useSamples';
import { useResults } from '@/hooks/useResults';
import { Loader2, AlertCircle, CheckCircle2, XCircle, ChevronLeft, User, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Result } from '@/types/result.types';
import toast from 'react-hot-toast';
import { StatusBadge } from '@/components/shared/StatusBadge';

const SampleInfoCard = ({ sample }: { sample: any }) => {
  const patient = sample?.testOrder?.patient;
  const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'Unknown';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center border-b border-slate-100 pb-2">
        <User className="w-4 h-4 mr-2 text-primary-500" />
        Patient Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Patient Name</span>
          <span className="text-sm font-medium text-slate-900">
            {patient?.firstName} {patient?.lastName}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">MRN</span>
          <span className="text-sm font-medium text-slate-900">{patient?.mrn}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Age</span>
          <span className="text-sm font-medium text-slate-900">{age} yrs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Gender</span>
          <span className="text-sm font-medium text-slate-900 capitalize">{patient?.gender?.toLowerCase() || 'Unknown'}</span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center border-b border-slate-100 pb-2 mt-4">
        <Activity className="w-4 h-4 mr-2 text-primary-500" />
        Order & Sample Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Order Number</span>
          <span className="text-sm font-medium text-slate-900">{sample?.testOrder?.orderNumber}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Sample Number</span>
          <span className="text-sm font-medium text-slate-900">{sample?.sampleNumber}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Barcode</span>
          <span className="text-sm font-mono font-medium text-slate-900">{sample?.barcode}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Dates</span>
          <span className="text-xs text-slate-700">Collected: {sample?.createdAt ? new Date(sample.createdAt).toLocaleDateString() : '-'}</span>
          <span className="text-xs text-slate-700">Updated: {sample?.updatedAt ? new Date(sample.updatedAt).toLocaleDateString() : '-'}</span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center border-b border-slate-100 pb-2 mt-4">
        <FileText className="w-4 h-4 mr-2 text-primary-500" />
        Test Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Test Name</span>
          <span className="text-sm font-medium text-slate-900">{sample?.orderItem?.testNameSnapshot}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">Specimen</span>
          <span className="text-sm font-medium text-slate-900">BLOOD (Standard)</span>
        </div>
      </div>
    </div>
  );
};

export default function DoctorVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;
  
  const { data: sample, isLoading: sampleLoading, error: sampleError } = useSample(sampleId);
  const { pendingResultsQuery, verifyResult, rejectResult } = useResults();
  
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  // Filter results for this specific sample
  const sampleResults = React.useMemo(() => {
    if (!pendingResultsQuery.data) return [];
    return pendingResultsQuery.data.filter(r => r.sampleId === sampleId);
  }, [pendingResultsQuery.data, sampleId]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      // Verify all results for this sample
      for (const res of sampleResults) {
        await verifyResult.mutateAsync(res.id);
      }
      toast.success('Results verified and finalized successfully');
      router.push('/dashboard/doctor/results');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to verify results');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const remark = window.prompt("Enter rejection remark (e.g. 'Please recheck', 'Repeat test'):");
    if (!remark) return; // Cancelled

    try {
      setIsRejecting(true);
      // Append remark to all results for this sample and update status via reject API
      for (const res of sampleResults) {
        await rejectResult.mutateAsync({
          id: res.id,
          reason: remark
        });
      }
      toast.success('Recheck requested successfully');
      router.push('/dashboard/doctor/results');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to request recheck');
    } finally {
      setIsRejecting(false);
    }
  };

  if (sampleLoading || pendingResultsQuery.isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }
  
  if (sampleError || !sample || sampleResults.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-slate-400" />
        <p>No pending results found for this sample.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/doctor/results')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  // Find timeline info
  const entryDate = sampleResults[0]?.createdAt ? new Date(sampleResults[0].createdAt).toLocaleString() : 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/doctor/results')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Queue
        </Button>
      </div>

      <PageHeader 
        title="Verify Laboratory Results" 
        description="Review entered parameters against reference ranges and clinical history." 
      />
      
      <SampleInfoCard sample={sample} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-primary-500" />
            Laboratory Parameters
          </h3>
          <span className="text-xs text-slate-500 flex items-center">
            <FileText className="w-3 h-3 mr-1" /> Entered on {entryDate}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ref Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Flag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sampleResults.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {res.parameterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{res.resultValue}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {res.unit || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {res.referenceRange || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {res.abnormalFlag === 'NORMAL' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        NORMAL
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        res.abnormalFlag?.includes('CRITICAL') ? 'bg-red-100 text-red-800 font-bold' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.abnormalFlag}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                    {res.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Verification Timeline</h4>
              <div className="flex items-center text-sm text-slate-600 gap-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span>Entered: {entryDate}</span>
                  <span className="text-xs text-slate-400 ml-1">(Tech: {sampleResults[0]?.enteredBy?.substring(0, 8) || 'System'})</span>
                </div>
                <div className="w-4 border-t border-dashed border-slate-300"></div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${sampleResults[0]?.resultStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className={sampleResults[0]?.resultStatus === 'VERIFIED' ? 'text-slate-900' : 'text-slate-400'}>
                    {sampleResults[0]?.resultStatus === 'VERIFIED' ? `Verified: ${new Date(sampleResults[0]?.verifiedAt!).toLocaleString()}` : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 shrink-0">
              {sampleResults[0]?.resultStatus === 'VERIFIED' ? (
                <Button 
                  onClick={() => window.open(`/report/${sampleId}`, '_blank')} 
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleReject} disabled={isApproving || isRejecting} className="border-red-200 text-red-600 hover:bg-red-50">
                    {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Request Recheck
                  </Button>
                  <Button onClick={handleApprove} disabled={isApproving || isRejecting} className="bg-green-600 hover:bg-green-700">
                    {isApproving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Approve & Verify
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
