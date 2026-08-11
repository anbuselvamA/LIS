import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Patient, patientFormSchema, PatientFormData } from '../../../../../types/patient.types';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { FormLayout } from '../../../../../components/shared/FormLayout';
import { Hash } from 'lucide-react';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => void;
  onForceSubmit?: (data: PatientFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  existingDuplicate?: any;
}

export function PatientForm({ patient, onSubmit, onForceSubmit, onCancel, isSubmitting, existingDuplicate }: PatientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? {
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      gender: patient.gender,
      phone: patient.phone || '',
      email: patient.email || '',
    } : {
      gender: 'UNKNOWN',
    },
  });

  return (
    <FormLayout
      onSubmit={handleSubmit(onSubmit)}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={patient ? 'Save Changes' : 'Register Patient'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* MRN — read-only info banner */}
        <div className="col-span-1 md:col-span-2">
          {patient ? (
            // Edit mode: show the actual MRN as read-only
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">MRN (Medical Record Number)</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-500 text-sm">
                <Hash className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="font-mono font-medium text-slate-700">{patient.mrn}</span>
                <span className="ml-auto text-xs text-slate-400 italic">System-generated · Immutable</span>
              </div>
            </div>
          ) : (
            // Register mode: show placeholder
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">MRN (Medical Record Number)</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-sm">
                <Hash className="w-4 h-4 shrink-0" />
                <span className="italic">MRN will be generated automatically after registration</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">First Name *</label>
          <Input 
            {...register('firstName')} 
            placeholder="Jane" 
          />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Last Name *</label>
          <Input 
            {...register('lastName')} 
            placeholder="Doe" 
          />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date of Birth *</label>
          <Input 
            type="date"
            {...register('dateOfBirth')} 
          />
          {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Gender *</label>
          <Select {...register('gender')}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="UNKNOWN">Unknown</option>
          </Select>
          {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <Input 
            {...register('phone')} 
            placeholder="+1 555-0123" 
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input 
            type="email"
            {...register('email')} 
            placeholder="patient@example.com" 
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      {existingDuplicate && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <h4 className="font-semibold text-amber-900 flex items-center gap-2">
            ⚠️ Phone Number Conflict
          </h4>
          <p className="text-sm text-amber-800">
            A patient with this phone number already exists: <strong>{existingDuplicate.firstName} {existingDuplicate.lastName} ({existingDuplicate.mrn})</strong>.
          </p>
          <p className="text-sm text-amber-800">
            If this is a family member sharing a phone number, you can force registration. Otherwise, please use the existing patient.
          </p>
          {onForceSubmit && (
            <div className="flex justify-end pt-2">
              <button 
                type="button"
                onClick={handleSubmit(onForceSubmit)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                disabled={isSubmitting}
              >
                Yes, Register Different Person
              </button>
            </div>
          )}
        </div>
      )}
    </FormLayout>
  );
}
