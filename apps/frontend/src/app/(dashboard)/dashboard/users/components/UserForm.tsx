import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '../../../../../types/mdm.types';
import { Role } from '../../../../../types/auth.types';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { FormLayout } from '../../../../../components/shared/FormLayout';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'DOCTOR', 'REFERRAL_DOCTOR']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      role: user?.role || 'RECEPTIONIST',
    },
  });

  return (
    <FormLayout 
      onSubmit={handleSubmit(onSubmit)} 
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Update Role' : 'Create User'}
    >
      <Input
        label="Email Address"
        type="email"
        placeholder="user@example.com"
        {...register('email')}
        error={errors.email?.message}
        disabled={isEditing}
      />
      
      {!isEditing && (
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
      )}
      
      <Select
        label="System Role"
        {...register('role')}
        error={errors.role?.message}
      >
        <option value="ADMIN">Admin</option>
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="LAB_TECHNICIAN">Lab Technician</option>
        <option value="DOCTOR">Doctor</option>
        <option value="REFERRAL_DOCTOR">Referral Doctor</option>
      </Select>
    </FormLayout>
  );
}
