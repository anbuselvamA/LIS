import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ReferralDoctor } from '../../../../../types/mdm.types';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { FormLayout } from '../../../../../components/shared/FormLayout';
import { useHospitals } from '../../../../../hooks/useHospitals';
import { useUsers } from '../../../../../hooks/useUsers';
import { useDoctors } from '../../../../../hooks/useDoctors';

const doctorSchema = z.object({
  firstName: z.string().min(2, 'First Name is required'),
  lastName: z.string().min(2, 'Last Name is required'),
  specialization: z.string().optional(),
  phone: z.string().optional(),
  hospitalId: z.string().min(1, 'Hospital is required'),
  userId: z.string().min(1, 'A system user (REFERRAL_DOCTOR role) must be linked'),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  doctor?: ReferralDoctor | null;
  onSubmit: (data: DoctorFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DoctorForm({ doctor, onSubmit, onCancel, isSubmitting }: DoctorFormProps) {
  const isEditing = !!doctor;
  const { getHospitals } = useHospitals();
  const { getUsers } = useUsers();

  const referralDoctorUsers = React.useMemo(() => {
    if (!getUsers.data) return [];
    return getUsers.data.filter(u => u.role === 'REFERRAL_DOCTOR');
  }, [getUsers.data]);

  const { getDoctors } = useDoctors();
  const linkedUserIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (getDoctors.data) {
      getDoctors.data.forEach(d => {
        if (d.userId) ids.add(d.userId);
      });
    }
    return ids;
  }, [getDoctors.data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      firstName: doctor?.firstName || '',
      lastName: doctor?.lastName || '',
      specialization: doctor?.specialization || '',
      phone: doctor?.phone || '',
      hospitalId: doctor?.hospitalId || '',
      userId: doctor?.userId || '',
    },
  });

  return (
    <FormLayout 
      onSubmit={handleSubmit(onSubmit)} 
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Update Doctor' : 'Register Doctor'}
    >
      <div className="mb-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Referral Doctor Code
        </label>
        <div className="mt-1 flex items-center h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          {isEditing ? doctor?.doctorCode : 'Will be automatically generated (RD-XXXX)'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Specialization"
          placeholder="Cardiology"
          {...register('specialization')}
          error={errors.specialization?.message}
        />
        <Input
          label="Phone"
          placeholder="+1 234 567 8900"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>
      
      <Select
        label="Associated Hospital"
        {...register('hospitalId')}
        error={errors.hospitalId?.message}
      >
        <option value="">Select Hospital</option>
        {getHospitals.data?.map(h => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </Select>

      <Select
        label="Linked System User (REFERRAL_DOCTOR role)"
        {...register('userId')}
        error={errors.userId?.message}
        disabled={isEditing}
      >
        <option value="">
          {getUsers.isLoading ? 'Loading users...' : 'Select a REFERRAL_DOCTOR user'}
        </option>
        {referralDoctorUsers.map(u => {
          const isLinked = linkedUserIds.has(u.id);
          // If editing, allow selecting the currently linked user
          const isDisabled = isLinked && (!isEditing || doctor?.userId !== u.id);
          return (
            <option key={u.id} value={u.id} disabled={isDisabled}>
              {isDisabled ? `✓ ${u.email} (Already Registered)` : `○ ${u.email}`}
            </option>
          );
        })}
      </Select>

      {!isEditing && referralDoctorUsers.length === 0 && !getUsers.isLoading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-700">
            ⚠️ No <strong>REFERRAL_DOCTOR</strong> users found. Please create a user with the 
            <strong> REFERRAL_DOCTOR</strong> role in <strong>System Users</strong> first, 
            then return here to register the doctor profile.
          </p>
        </div>
      )}
    </FormLayout>
  );
}
