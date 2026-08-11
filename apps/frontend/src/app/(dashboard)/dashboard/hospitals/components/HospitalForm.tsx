import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ReferralHospital } from '../../../../../types/mdm.types';
import { Input } from '../../../../../components/ui/input';
import { FormLayout } from '../../../../../components/shared/FormLayout';

const hospitalSchema = z.object({
  hospitalCode: z.string().min(2, 'Hospital Code is required'),
  name: z.string().min(2, 'Name is required'),
  address: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

interface HospitalFormProps {
  hospital?: ReferralHospital | null;
  onSubmit: (data: HospitalFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function HospitalForm({ hospital, onSubmit, onCancel, isSubmitting }: HospitalFormProps) {
  const isEditing = !!hospital;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      hospitalCode: hospital?.hospitalCode || '',
      name: hospital?.name || '',
      address: hospital?.address || '',
      contactEmail: hospital?.contactEmail || '',
      contactPhone: hospital?.contactPhone || '',
    },
  });

  return (
    <FormLayout 
      onSubmit={handleSubmit(onSubmit)} 
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Update Hospital' : 'Register Hospital'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Hospital Code"
          placeholder="e.g. HOSP-001"
          {...register('hospitalCode')}
          error={errors.hospitalCode?.message}
          disabled={isEditing}
        />
        <Input
          label="Hospital Name"
          placeholder="General Hospital"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <Input
        label="Address"
        placeholder="123 Health Ave"
        {...register('address')}
        error={errors.address?.message}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contact Email"
          type="email"
          placeholder="contact@hospital.com"
          {...register('contactEmail')}
          error={errors.contactEmail?.message}
        />
        <Input
          label="Contact Phone"
          placeholder="+1 234 567 8900"
          {...register('contactPhone')}
          error={errors.contactPhone?.message}
        />
      </div>
    </FormLayout>
  );
}
