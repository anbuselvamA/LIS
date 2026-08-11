import * as React from 'react';
import { Dialog } from '../../../../../components/ui/dialog';
import { PatientForm } from './PatientForm';
import { Patient, PatientFormData } from '../../../../../types/patient.types';
import toast from 'react-hot-toast';
import { usePatients } from '../../../../../hooks/usePatients';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import { Search, User, Phone, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/axios';
import { Badge } from '../../../../../components/ui/badge';

interface PatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onPatientSelected?: (patient: Patient) => void;
}

export function PatientDialog({ isOpen, onClose, patient, onPatientSelected }: PatientDialogProps) {
  const { createPatient, updatePatient } = usePatients();
  const [step, setStep] = React.useState<'SEARCH' | 'FORM'>('SEARCH');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [foundPatient, setFoundPatient] = React.useState<Patient | null>(null);
  const [existingDuplicate, setExistingDuplicate] = React.useState<any>(null);

  // Reset dialog state when it opens
  React.useEffect(() => {
    if (isOpen) {
      if (patient) {
        setStep('FORM'); // Edit mode directly opens form
      } else {
        setStep('SEARCH');
      }
      setSearchQuery('');
      setFoundPatient(null);
      setExistingDuplicate(null);
    }
  }, [isOpen, patient]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/patients/search?q=${encodeURIComponent(searchQuery)}`);
      const results = response.data;
      if (results && results.length > 0) {
        setFoundPatient(results[0]); // Top result
      } else {
        setFoundPatient(null);
        toast.error('No existing patient found. Please register.');
        setStep('FORM');
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (data: PatientFormData, forceCreate?: boolean) => {
    if (patient) {
      updatePatient.mutate(
        { id: patient.id, data },
        {
          onSuccess: () => {
            toast.success('Patient updated successfully');
            onClose();
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update patient');
          },
        }
      );
    } else {
      createPatient.mutate({ ...data, forceCreate }, {
        onSuccess: (newPatient: any) => {
          toast.success(
            `Patient registered successfully!\nMRN: ${newPatient?.mrn ?? 'Generated'}`,
            { duration: 6000 }
          );
          if (onPatientSelected) onPatientSelected(newPatient);
          onClose();
        },
        onError: (error: any) => {
          if (error.response?.status === 409 && error.response?.data?.existingPatient) {
            setExistingDuplicate(error.response.data.existingPatient);
            toast.error('Patient with this phone already exists!');
          } else {
            toast.error(error.response?.data?.message || 'Failed to register patient');
          }
        }
      });
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={step === 'SEARCH' ? 'Check Existing Patient' : (patient ? 'Edit Patient' : 'Register New Patient')}
      description={step === 'SEARCH' ? 'Search by phone number before creating to avoid duplicates.' : (patient ? 'Update patient details in the system.' : 'Add a new patient to the registry.')}
      className="max-w-2xl"
    >
      {step === 'SEARCH' ? (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                autoFocus
                placeholder="Search by Phone, Name, or MRN..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {foundPatient && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    Existing Patient Found
                  </h4>
                  <p className="text-sm text-indigo-700 mt-1">This patient is already registered in the system.</p>
                </div>
              </div>

              <div className="bg-white rounded-md border border-indigo-100 p-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">MRN</span>
                  <span className="font-mono font-medium">{foundPatient.mrn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Name</span>
                  <span className="font-medium">{foundPatient.firstName} {foundPatient.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Phone</span>
                  <span>{foundPatient.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Previous Orders</span>
                  <Badge variant="secondary">{foundPatient.orders?.length || 0} visits</Badge>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('FORM')}
                >
                  Register New Person Anyway
                </Button>
                <Button 
                  onClick={() => {
                    if (onPatientSelected) onPatientSelected(foundPatient);
                    onClose();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Use Existing Patient
                </Button>
              </div>
            </div>
          )}

          {!foundPatient && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setStep('FORM')} variant="ghost">Skip & Register New</Button>
            </div>
          )}
        </div>
      ) : (
        <PatientForm 
          patient={patient} 
          onSubmit={(data) => handleSubmit(data, false)}
          onForceSubmit={(data) => handleSubmit(data, true)}
          onCancel={onClose}
          isSubmitting={createPatient.isPending || updatePatient.isPending}
          existingDuplicate={existingDuplicate}
        />
      )}
    </Dialog>
  );
}
