'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useReferrals } from '../../../../../hooks/useReferrals';
import { useTests } from '../../../../../hooks/useTests';
import { useAuth } from '../../../../../context/AuthContext';
import { apiClient } from '../../../../../lib/axios';
import { Button } from '../../../../../components/ui/button';
import { Network, Search, Loader2, CheckCircle2, UserPlus, FileCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  // Step 1: Patient Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;

  // Step 2 & 3
  requestedTestIds: string[];
  priority: string;
  reason: string;
  notes: string;
}

export default function NewReferralRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createReferral } = useReferrals();
  const { getTests } = useTests();

  const [step, setStep] = React.useState(1);
  const [isChecking, setIsChecking] = React.useState(false);
  const [matchedPatient, setMatchedPatient] = React.useState<any | null>(null);
  const [successData, setSuccessData] = React.useState<any | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isNewPatient, setIsNewPatient] = React.useState(false);
  
  const { control, handleSubmit, getValues, watch, trigger } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      email: '',
      address: '',
      requestedTestIds: [],
      priority: 'ROUTINE',
      reason: '',
      notes: '',
    }
  });

  // Debounced patient search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsChecking(true);
        try {
          const response = await apiClient.get(`/patients/search?q=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          toast.error('Failed to search patients');
        } finally {
          setIsChecking(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectExistingPatient = (patient: any) => {
    setMatchedPatient(patient);
    setIsNewPatient(false);
    
    // Auto-fill form data for the review step
    Object.keys(patient).forEach((key: any) => {
      const val = patient[key];
      if (val !== undefined && val !== null) {
        // format date properly if needed, although we are not showing the form anymore
      }
    });

    setStep(2);
  };

  const handleRegisterNew = () => {
    setMatchedPatient(null);
    setIsNewPatient(true);
    setStep(1.5); // Use 1.5 for the actual registration form step
  };

  const onSubmit = async (data: FormData) => {
    if (data.requestedTestIds.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    try {
      const payload: any = {
        requestedTestIds: data.requestedTestIds,
        priority: data.priority,
        reason: data.reason,
        notes: data.notes
      };

      if (matchedPatient) {
        payload.patientId = matchedPatient.id;
      } else {
        payload.patientDetails = {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: data.address
        };
      }

      const response = await createReferral.mutateAsync(payload);
      setSuccessData(response);
      setStep(6); // Success Step
    } catch (err: any) {
      let errMsg = err.response?.data?.message || 'Failed to create referral request';
      if (errMsg === 'Referral doctor profile not found for this user' || errMsg.includes('not configured')) {
        errMsg = 'Your Referral Doctor account is not configured. Please contact the administrator.';
      }
      toast.error(errMsg);
    }
  };

  if (getTests.isLoading) {
    return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Loading Test Catalogue...</div>;
  }

  // --- STEP 6: SUCCESS SCREEN ---
  if (step === 6 && successData) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Request Created</h1>
            <p className="text-slate-500 mt-2">The laboratory request has been securely submitted.</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-6 text-left grid grid-cols-2 gap-y-4 gap-x-8 border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Patient</p>
              <p className="font-semibold text-slate-900">{successData.patient.firstName} {successData.patient.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">MRN</p>
              <p className="font-semibold text-slate-900 bg-white px-2 py-1 rounded inline-block border">{successData.patient.mrn}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Referral Number</p>
              <p className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100">{successData.referralNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-slate-900">{successData.status}</p>
            </div>
            <div className="col-span-2 border-t pt-4 mt-2">
              <p className="text-sm font-medium text-slate-500 mb-1">Tests Requested</p>
              <div className="flex gap-2 flex-wrap">
                {successData.requestedTests?.map((t: any) => (
                  <span key={t.id} className="bg-white border rounded px-2 py-1 text-sm font-medium">{t.testName}</span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-slate-500 mb-1">Created At</p>
              <p className="font-semibold text-slate-900">{new Date(successData.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <Button onClick={() => router.push('/dashboard/referral')}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => { setStep(1); setSuccessData(null); setMatchedPatient(null); }}>Create Another Referral</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Network className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Referral Request</h1>
          <p className="text-sm text-slate-500">Step {step} of 5</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* STEP 1: PATIENT INFO */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold">1. Select Patient</h2>
              <p className="text-sm text-slate-500">Search patients registered under your referral profile.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name / MRN / Phone"
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isChecking && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 animate-spin" />}
              </div>

              {searchQuery.length >= 3 && searchResults.length === 0 && !isChecking && (
                <div className="bg-slate-50 p-6 text-center border rounded-lg">
                  <p className="text-sm text-slate-600 mb-4">No patient found in your referral patient list.</p>
                  <Button type="button" onClick={handleRegisterNew}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register New Patient
                  </Button>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{patient.firstName} {patient.lastName}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                          <span className="font-medium px-1.5 py-0.5 bg-slate-100 rounded border">{patient.mrn}</span>
                          <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                          <span>{patient.gender}</span>
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                      <Button type="button" variant="outline" onClick={() => selectExistingPatient(patient)}>
                        Select Patient
                      </Button>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t text-center">
                    <p className="text-xs text-slate-500 mb-2">Patient not in the list?</p>
                    <Button type="button" variant="ghost" className="text-blue-600" onClick={handleRegisterNew}>
                      + Register New Patient
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1.5: PATIENT REGISTRATION FORM */}
        {step === 1.5 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">New Patient Registration</h2>
                <p className="text-sm text-slate-500">Enter patient demographic details to begin.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>Cancel</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-medium">First Name <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input {...field} type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="First Name" />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input {...field} type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Last Name" />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="dateOfBirth"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input {...field} type="date" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Gender</label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <select {...field} className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="phone"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input {...field} type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="10-digit number" />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email (Optional)</label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <input {...field} type="email" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email Address" />
                  )}
                />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-sm font-medium">Address (Optional)</label>
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <textarea {...field} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Patient's address..." />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="button" onClick={async () => {
                const isValid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'phone']);
                if (isValid) setStep(2);
              }}>
                Continue to Test Selection <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: TEST SELECTION (Replaced Patient Validation) */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold">2. Patient Validation</h2>
              {matchedPatient ? (
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium border border-green-200">Existing Patient: {matchedPatient.mrn}</div>
              ) : (
                 <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium border border-blue-200">New Patient</div>
              )}
            </div>

            <Controller
              control={control}
              name="requestedTestIds"
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getTests.data?.filter((t: any) => t.isActive).map((test: any) => (
                    <label key={test.id} className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${field.value.includes(test.id) ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="mt-1"
                        checked={field.value.includes(test.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, test.id]);
                          } else {
                            field.onChange(field.value.filter((id: string) => id !== test.id));
                          }
                        }}
                      />
                      <div>
                        <div className="font-medium text-sm text-slate-900">{test.testName}</div>
                        <div className="text-xs text-slate-500">{test.testCode}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
            
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(isNewPatient ? 1.5 : 1)}>Back</Button>
              <Button type="button" onClick={() => {
                if (getValues('requestedTestIds').length === 0) {
                  toast.error('Select at least one test');
                } else {
                  setStep(3);
                }
              }}>Continue <ArrowRight className="w-4 h-4 ml-2"/></Button>
            </div>
          </div>
        )}

        {/* STEP 3: CLINICAL INFO */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold">3. Clinical Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <select {...field} className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT</option>
                    </select>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Referral</label>
                <Controller
                  control={control}
                  name="reason"
                  render={({ field }) => (
                    <input {...field} type="text" className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Pre-operative assessment" />
                  )}
                />
              </div>
              
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium">Clinical Notes</label>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <textarea {...field} rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Any additional clinical information..." />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button type="button" onClick={() => setStep(4)}>Review Request <ArrowRight className="w-4 h-4 ml-2"/></Button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-4 flex items-center gap-2 text-blue-700">
              <FileCheck className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-900">4. Review & Submit</h2>
            </div>
            
            <div className="bg-slate-50 border rounded-lg p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Patient</p>
                {matchedPatient ? (
                  <p className="font-semibold text-slate-900">{matchedPatient.firstName} {matchedPatient.lastName}</p>
                ) : (
                  <p className="font-semibold text-slate-900">{getValues('firstName')} {getValues('lastName')}</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 mb-1">MRN</p>
                {matchedPatient ? (
                  <p className="font-semibold text-slate-900">{matchedPatient.mrn}</p>
                ) : (
                  <p className="font-medium text-blue-600 italic">Will be auto-generated</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 mb-1">Priority</p>
                <p className="font-medium text-slate-900">{getValues('priority')}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Reason</p>
                <p className="font-medium text-slate-900">{getValues('reason') || 'N/A'}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-slate-500 mb-1">Selected Tests</p>
                <div className="flex gap-2 flex-wrap">
                  {getValues('requestedTestIds').map(id => {
                    const t = getTests.data?.find((test: any) => test.id === id);
                    return <span key={id} className="bg-white border rounded px-2 py-1 font-medium">{t?.testName}</span>
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button type="submit" disabled={createReferral.isPending}>
                {createReferral.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Referral Request
              </Button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
