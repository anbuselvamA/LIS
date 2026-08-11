'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOrders } from '../../../../../hooks/useOrders';
import { usePatients } from '../../../../../hooks/usePatients';
import { useTests } from '../../../../../hooks/useTests';
import { useReferral } from '../../../../../hooks/useReferrals';
import { PatientDialog } from '../../patients/components/PatientDialog';
import { PageHeader } from '../../../../../components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { ArrowLeft, Plus, Search, Check, Calculator, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';

const orderFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  testIds: z.array(z.string()).min(1, 'Please select at least one test'),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function CreateOrderPage() {
  const router = useRouter();
  const { createOrder } = useOrders();
  const { patientsQuery } = usePatients();
  const { getTests } = useTests();
  const searchParams = useSearchParams();
  const referralId = searchParams.get('referralId');
  const { data: referralData, isLoading: isLoadingReferral } = useReferral(referralId || '');

  const [isPatientDialogOpen, setIsPatientDialogOpen] = React.useState(false);
  const [patientSearch, setPatientSearch] = React.useState('');
  const [testSearch, setTestSearch] = React.useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      patientId: '',
      testIds: [],
    }
  });

  const selectedPatientId = watch('patientId');
  const selectedTestIds = watch('testIds');

  React.useEffect(() => {
    if (referralData) {
      if (referralData.patientId) {
        setValue('patientId', referralData.patientId);
      }
      if (referralData.requestedTests) {
        setValue('testIds', referralData.requestedTests.map((t: any) => t.id));
      }
    }
  }, [referralData, setValue]);

  // Filtered lists
  const filteredPatients = React.useMemo(() => {
    if (!patientsQuery.data) return [];
    return patientsQuery.data.filter(p => 
      p.mrn.toLowerCase().includes(patientSearch.toLowerCase()) || 
      p.firstName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.lastName.toLowerCase().includes(patientSearch.toLowerCase())
    ).slice(0, 5); // Limit to top 5 for speed
  }, [patientsQuery.data, patientSearch]);

  const filteredTests = React.useMemo(() => {
    if (!getTests.data) return [];
    return getTests.data.filter(t => 
      t.isActive && (
        t.testName.toLowerCase().includes(testSearch.toLowerCase()) ||
        t.testCode.toLowerCase().includes(testSearch.toLowerCase())
      )
    );
  }, [getTests.data, testSearch]);

  const selectedTests = React.useMemo(() => {
    if (!getTests.data) return [];
    return getTests.data.filter(t => selectedTestIds.includes(t.id));
  }, [getTests.data, selectedTestIds]);

  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);

  const toggleTest = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      setValue('testIds', selectedTestIds.filter(id => id !== testId));
    } else {
      setValue('testIds', [...selectedTestIds, testId]);
    }
  };

  const onSubmit = (data: OrderFormValues) => {
    createOrder.mutate({
      patientId: data.patientId,
      items: data.testIds.map(testId => ({ testId })),
      referralRequestId: referralId || undefined
    }, {
      onSuccess: () => {
        toast.success('Order created successfully!');
        router.push('/dashboard/orders');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create order');
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn pb-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard/orders')}
          className="text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title={referralId ? "Create Order from Referral" : "Create New Order"} 
          description="Register patient and select tests in one unified workflow."
        />
      </div>

      {isLoadingReferral && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-md animate-pulse">
          Loading referral data...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">1. Select Patient</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsPatientDialogOpen(true)} className="h-8">
                  <Plus className="h-4 w-4 mr-1" /> New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search MRN or Name..." 
                  className="pl-9"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {filteredPatients.map(patient => (
                  <div 
                    key={patient.id}
                    onClick={() => setValue('patientId', patient.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatientId === patient.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{patient.mrn}</p>
                      </div>
                      {selectedPatientId === patient.id && <Check className="h-5 w-5 text-blue-600" />}
                    </div>
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No patients found. Create a new one.</p>
                )}
              </div>
              {errors.patientId && <p className="text-sm text-red-500 font-medium">{errors.patientId.message}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Test Selection & Summary */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <Card className="border-gray-200 shadow-sm flex-1">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold">2. Select Tests</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search Test Catalogue..." 
                  className="pl-9"
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredTests.map(test => {
                  const isSelected = selectedTestIds.includes(test.id);
                  return (
                    <div 
                      key={test.id}
                      onClick={() => toggleTest(test.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-700 shadow-md text-white' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded bg-opacity-20 ${isSelected ? 'bg-white text-white' : 'bg-blue-100 text-blue-600'}`}>
                        <Beaker className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>{test.testName}</p>
                        <div className={`flex justify-between items-center mt-1 text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          <span className="font-mono">{test.testCode}</span>
                          <span className="font-semibold">${test.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.testIds && <p className="text-sm text-red-500 font-medium mt-3">{errors.testIds.message}</p>}
            </CardContent>
          </Card>

          {/* Bottom Summary Bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 sticky bottom-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Order Summary</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-500">for {selectedTests.length} tests</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              disabled={createOrder.isPending || !selectedPatientId || selectedTestIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700 px-8 text-base shadow-sm"
            >
              {createOrder.isPending ? 'Processing...' : 'Create Order'}
            </Button>
          </div>
        </div>
      </form>

      <PatientDialog 
        isOpen={isPatientDialogOpen} 
        onClose={() => setIsPatientDialogOpen(false)} 
        onPatientSelected={(patient) => {
          setValue('patientId', patient.id);
          setPatientSearch(patient.phone || patient.mrn);
        }}
      />
    </div>
  );
}
