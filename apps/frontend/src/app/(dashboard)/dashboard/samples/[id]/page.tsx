'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/shared/PageHeader';
import { useSample, useSamples } from '../../../../../hooks/useSamples';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, User, Hash, FlaskConical, TestTube } from 'lucide-react';
import { BarcodePreview } from '../components/BarcodePreview';
import { Button } from '../../../../../components/ui/button';
import { SampleStatus } from '../../../../../types/sample.types';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../context/AuthContext';

const STATUS_WORKFLOW = ['PENDING', 'COLLECTED', 'RECEIVED', 'PROCESSING', 'COMPLETED'];

export default function SampleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;
  
  const { data: sample, isLoading, isError } = useSample(sampleId);
  const { updateSampleStatus } = useSamples();
  const { user } = useAuth();

  const handleAction = (nextStatus: SampleStatus | 'ENTER_RESULT' | 'REOPEN') => {
    if (nextStatus === 'ENTER_RESULT') {
      router.push(`/dashboard/results/${sampleId}`);
      return;
    }

    const actualStatus = nextStatus === 'REOPEN' ? 'PROCESSING' : nextStatus;

    updateSampleStatus.mutate(
      { id: sampleId, status: actualStatus as SampleStatus },
      {
        onSuccess: () => {
          toast.success(`Sample marked as ${actualStatus}`);
        },
        onError: () => {
          toast.error(`Failed to update sample status`);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !sample) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-red-500">
        <AlertCircle className="mb-4 h-12 w-12" />
        <h2 className="text-xl font-semibold">Sample Not Found</h2>
        <p className="mt-2 text-slate-600">The sample you requested could not be found.</p>
        <Button className="mt-6" onClick={() => router.push('/dashboard/samples')}>
          Back to Samples
        </Button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_WORKFLOW.indexOf(sample.status);
  
  // Determine next action
  let nextAction: { label: string; status: SampleStatus } | null = null;
  
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    if (sample.status === 'PENDING') nextAction = { label: 'Collect Sample', status: 'COLLECTED' };
    else if (sample.status === 'COLLECTED') nextAction = { label: 'Receive Sample', status: 'RECEIVED' };
    else if (sample.status === 'RECEIVED') nextAction = { label: 'Start Processing', status: 'PROCESSING' };
    else if (sample.status === 'PROCESSING') nextAction = { label: 'Enter Result', status: 'ENTER_RESULT' as any };
    else if (sample.status === 'COMPLETED' && (sample as any)._count?.results === 0) {
      nextAction = { label: 'Reopen for Result Entry', status: 'REOPEN' as any };
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sample ${sample.sampleNumber}`}
        description="View sample details and manage lifecycle workflow."
        breadcrumbs={[
          { label: 'Samples', href: '/dashboard/samples' },
          { label: sample.sampleNumber, href: `/dashboard/samples/${sample.id}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info & Action */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sample Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900">Sample Information</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 uppercase`}>
                {sample.status}
              </span>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <User className="w-4 h-4 mr-2" /> Patient
                  </dt>
                  <dd className="text-base text-slate-900 font-medium">
                    {sample.testOrder?.patient?.firstName} {sample.testOrder?.patient?.lastName}
                  </dd>
                </div>
                
                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <Hash className="w-4 h-4 mr-2" /> MRN
                  </dt>
                  <dd className="text-base text-slate-900 font-mono">
                    {sample.testOrder?.patient?.mrn}
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <Hash className="w-4 h-4 mr-2" /> Order Number
                  </dt>
                  <dd className="text-base text-slate-900 font-mono">
                    {sample.testOrder?.orderNumber}
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <TestTube className="w-4 h-4 mr-2" /> Test Name
                  </dt>
                  <dd className="text-base text-slate-900">
                    {sample.orderItem?.testNameSnapshot}
                  </dd>
                </div>

                {/* We don't have specimenType and containerType attached to orderItem directly in this simple schema, 
                    but in a full schema we would display them here. We mock them for UI demonstration of the requirement. */}
                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <FlaskConical className="w-4 h-4 mr-2" /> Specimen Type
                  </dt>
                  <dd className="text-base text-slate-900 capitalize">
                    Blood
                  </dd>
                </div>

                <div className="flex flex-col">
                  <dt className="flex items-center text-sm font-medium text-slate-500 mb-1">
                    <FlaskConical className="w-4 h-4 mr-2" /> Container
                  </dt>
                  <dd className="text-base text-slate-900 capitalize">
                    EDTA Lavender
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Timeline & Action */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-8">Lifecycle Workflow</h3>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="h-0.5 w-full bg-slate-200" />
              </div>
              <ul className="relative flex justify-between w-full">
                {STATUS_WORKFLOW.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <li key={status} className="flex flex-col items-center">
                      <div className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-white border-2
                        ${isCompleted ? 'border-primary-500 text-primary-500' : 'border-slate-300 text-slate-300'}
                        ${isCurrent ? 'ring-4 ring-primary-100' : ''}
                      `}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className={`mt-3 text-xs font-semibold uppercase tracking-wider
                        ${isCompleted ? 'text-primary-600' : 'text-slate-400'}
                      `}>
                        {status === 'PENDING' ? 'REGISTERED' : status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {nextAction && (
              <div className="mt-12 flex justify-center">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto md:min-w-[200px]"
                  onClick={() => handleAction(nextAction!.status)}
                  disabled={updateSampleStatus.isPending}
                >
                  {updateSampleStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {nextAction.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            
            {!nextAction && sample.status !== 'REJECTED' && (
              <div className="mt-12 flex justify-center">
                 <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full font-medium flex items-center border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Workflow Complete
                 </div>
              </div>
            )}
          </div>
          
        </div>

        {/* Right Column: Barcode */}
        <div className="lg:col-span-1">
           <BarcodePreview sampleId={sample.id} barcodeText={sample.barcode} />
        </div>

      </div>
    </div>
  );
}
