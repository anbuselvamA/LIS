'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '../../../../../components/shared/PageHeader';
import { useSample } from '../../../../../hooks/useSamples';
import { useResults } from '../../../../../hooks/useResults';
import { useTestParameters, TestParameter } from '../../../../../hooks/useTestParameters';
import { useAuth } from '../../../../../context/AuthContext';
import { Loader2, AlertCircle, Save, CheckCircle2, ChevronLeft, User, Activity, Beaker } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { AbnormalFlag } from '../../../../../types/result.types';
import toast from 'react-hot-toast';

// Reusable Sample Info Card
const SampleInfoCard = ({ sample }: { sample: any }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
      <Activity className="w-4 h-4 mr-2 text-primary-500" />
      Sample Information
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 mb-1 flex items-center">
          <User className="w-3 h-3 mr-1" /> Patient
        </span>
        <span className="text-sm font-medium text-slate-900">
          {sample.testOrder?.patient?.firstName} {sample.testOrder?.patient?.lastName}
        </span>
        <span className="text-xs text-slate-500">{sample.testOrder?.patient?.mrn}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 mb-1">Test Name</span>
        <span className="text-sm font-medium text-slate-900">{sample.orderItem?.testNameSnapshot}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 mb-1">Barcode</span>
        <span className="text-sm font-mono font-medium text-slate-900">{sample.barcode}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 mb-1">Order Number</span>
        <span className="text-sm font-medium text-slate-900">{sample.testOrder?.orderNumber}</span>
      </div>
    </div>
  </div>
);

// Form Schema
const resultSchema = z.object({
  results: z.array(z.object({
    parameterCode: z.string(),
    parameterName: z.string(),
    unit: z.string(),
    referenceRange: z.string(),
    resultValue: z.string().min(1, 'Result value is required'),
    abnormalFlag: z.enum(['NORMAL', 'HIGH', 'LOW', 'CRITICAL_HIGH', 'CRITICAL_LOW']).optional(),
    interpretation: z.string().optional(),
    remarks: z.string().optional(),
  }))
});

type ResultFormValues = z.infer<typeof resultSchema>;

export default function ResultEntryPage() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;
  const { data: sample, isLoading, error } = useSample(sampleId);
  const { createResult } = useResults();
  const { getParametersForTest } = useTestParameters();
  const { user } = useAuth();
  
  const [parameters, setParameters] = React.useState<TestParameter[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, formState: { errors, isDirty }, watch, reset } = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: { results: [] }
  });

  const { fields } = useFieldArray({
    control,
    name: "results"
  });

  // Initialize form when sample loads
  React.useEffect(() => {
    if (sample && sample.orderItem) {
      const params = getParametersForTest(sample.orderItem.testNameSnapshot);
      setParameters(params);
      reset({
        results: params.map(p => ({
          parameterCode: p.parameterCode,
          parameterName: p.parameterName,
          unit: p.unit,
          referenceRange: p.referenceRange,
          resultValue: '',
          abnormalFlag: 'NORMAL' as AbnormalFlag,
          interpretation: '',
          remarks: ''
        }))
      });
    }
  }, [sample?.id, sample?.orderItem?.testNameSnapshot, reset]); // Removed getParametersForTest to prevent infinite resets

  const formValues = watch();

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const onSubmit = async (data: ResultFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Submit all results sequentially
      // NOTE: As per constraints, SampleStatus remains PROCESSING. ResultStatus becomes ENTERED.
      for (const res of data.results) {
        await createResult.mutateAsync({
          sampleId,
          parameterCode: res.parameterCode,
          parameterName: res.parameterName,
          resultValue: res.resultValue,
          unit: res.unit,
          referenceRange: res.referenceRange,
          abnormalFlag: res.abnormalFlag,
          interpretation: res.interpretation,
          entryMode: 'MANUAL',
          remarks: res.remarks
        });
      }
      
      toast.success('Results saved successfully');
      router.push('/dashboard/results');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save results');
    } finally {
      setIsSubmitting(false);
      setIsPreviewOpen(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (error || !sample) return <div className="p-12 text-center text-red-500">Failed to load sample details.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <PageHeader 
        title={isAdmin ? "Sample Details" : "Enter Results"} 
        description={isAdmin ? "View sample details (Read Only)." : "Enter and validate laboratory test results."} 
      />
      
      <SampleInfoCard sample={sample} />

      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Read Only View</h3>
          <p>Administrators cannot enter test results. Results are pending entry by Laboratory staff.</p>
        </div>
      ) : !isPreviewOpen ? (
        <form onSubmit={handleSubmit(handlePreview)} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameter</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ref Range</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Flag</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {field.parameterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Controller
                          control={control}
                          name={`results.${index}.resultValue`}
                          render={({ field: inputProps }) => (
                            <div className="flex flex-col">
                              <input
                                {...inputProps}
                                className={`block w-full rounded-md sm:text-sm px-3 py-2 border ${
                                  errors.results?.[index]?.resultValue ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'
                                } shadow-sm`}
                                placeholder="Enter value"
                              />
                              {errors.results?.[index]?.resultValue && (
                                <span className="text-xs text-red-500 mt-1">{errors.results?.[index]?.resultValue?.message}</span>
                              )}
                            </div>
                          )}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {field.unit || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {field.referenceRange || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <Controller
                          control={control}
                          name={`results.${index}.abnormalFlag`}
                          render={({ field: selectProps }) => (
                            <select
                              {...selectProps}
                              className="block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            >
                              <option value="NORMAL">Normal</option>
                              <option value="HIGH">High</option>
                              <option value="LOW">Low</option>
                              <option value="CRITICAL_HIGH">Critical High</option>
                              <option value="CRITICAL_LOW">Critical Low</option>
                            </select>
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button type="submit">
                Review Results
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-3">Confirm Results</h3>
          <div className="space-y-4">
            {formValues.results?.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{res.parameterName}</span>
                  <span className="text-xs text-slate-500">Ref: {res.referenceRange || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-slate-900">{res.resultValue} {res.unit}</span>
                  {res.abnormalFlag !== 'NORMAL' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      {res.abnormalFlag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} disabled={isSubmitting}>
              Edit
            </Button>
            <Button onClick={() => onSubmit(formValues as ResultFormValues)} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save & Send for Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
