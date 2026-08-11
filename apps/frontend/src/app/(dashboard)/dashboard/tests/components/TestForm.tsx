import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Test, SpecimenType, ContainerType } from '../../../../../types/mdm.types';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { FormLayout } from '../../../../../components/shared/FormLayout';

const testSchema = z.object({
  testCode: z.string().min(2, 'Test Code is required'),
  testName: z.string().min(2, 'Test Name is required'),
  description: z.string().optional(),
  specimenType: z.enum(['BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'SALIVA', 'SWAB', 'TISSUE', 'OTHER']),
  containerType: z.enum(['RED_TOP', 'PURPLE_TOP', 'BLUE_TOP', 'GREEN_TOP', 'YELLOW_TOP', 'GREY_TOP', 'STERILE_CUP', 'SWAB_TUBE', 'OTHER']),
  fastingRequired: z.boolean(),
  turnaroundTimeHours: z.number().min(1, 'TAT must be at least 1 hour'),
  price: z.number().min(0, 'Price must be positive'),
});

type TestFormValues = z.infer<typeof testSchema>;

interface TestFormProps {
  test?: Test | null;
  onSubmit: (data: TestFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TestForm({ test, onSubmit, onCancel, isSubmitting }: TestFormProps) {
  const isEditing = !!test;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testCode: test?.testCode || '',
      testName: test?.testName || '',
      description: test?.description || '',
      specimenType: test?.specimenType || 'BLOOD',
      containerType: test?.containerType || 'RED_TOP',
      fastingRequired: test?.fastingRequired || false,
      turnaroundTimeHours: test?.turnaroundTimeHours || 24,
      price: test?.price || 0,
    },
  });

  return (
    <FormLayout 
      onSubmit={handleSubmit(onSubmit)} 
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Update Test' : 'Create Test'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Test Code"
          placeholder="e.g. CBC01"
          {...register('testCode')}
          error={errors.testCode?.message}
          disabled={isEditing}
        />
        <Input
          label="Test Name"
          placeholder="Complete Blood Count"
          {...register('testName')}
          error={errors.testName?.message}
        />
      </div>

      <Input
        label="Description"
        placeholder="Brief description of the test"
        {...register('description')}
        error={errors.description?.message}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Specimen Type"
          {...register('specimenType')}
          error={errors.specimenType?.message}
        >
          <option value="BLOOD">Blood</option>
          <option value="SERUM">Serum</option>
          <option value="PLASMA">Plasma</option>
          <option value="URINE">Urine</option>
          <option value="STOOL">Stool</option>
          <option value="SALIVA">Saliva</option>
          <option value="SWAB">Swab</option>
          <option value="TISSUE">Tissue</option>
          <option value="OTHER">Other</option>
        </Select>

        <Select
          label="Container Type"
          {...register('containerType')}
          error={errors.containerType?.message}
        >
          <option value="RED_TOP">Red Top</option>
          <option value="PURPLE_TOP">Purple Top</option>
          <option value="BLUE_TOP">Blue Top</option>
          <option value="GREEN_TOP">Green Top</option>
          <option value="YELLOW_TOP">Yellow Top</option>
          <option value="GREY_TOP">Grey Top</option>
          <option value="STERILE_CUP">Sterile Cup</option>
          <option value="SWAB_TUBE">Swab Tube</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="TAT (Hours)"
          type="number"
          min="1"
          {...register('turnaroundTimeHours', { valueAsNumber: true })}
          error={errors.turnaroundTimeHours?.message}
        />
        <Input
          label="Price ($)"
          type="number"
          min="0"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <label className="flex flex-col gap-1.5 justify-center mt-6">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              {...register('fastingRequired')}
            />
            <span className="text-sm font-medium leading-none text-gray-700">Fasting Required</span>
          </div>
        </label>
      </div>
    </FormLayout>
  );
}
