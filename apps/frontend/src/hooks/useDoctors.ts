import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { ReferralDoctor } from '../types/mdm.types';
import toast from 'react-hot-toast';

export const useDoctors = () => {
  const queryClient = useQueryClient();

  const getDoctors = useQuery({
    queryKey: ['referral-doctors'],
    queryFn: async () => {
      const { data } = await apiClient.get<ReferralDoctor[]>('/referral-doctors');
      return data;
    },
  });

  const createDoctor = useMutation({
    mutationFn: async (newDoctor: Partial<ReferralDoctor>) => {
      const { data } = await apiClient.post('/referral-doctors', newDoctor);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-doctors'] });
      toast.success('Referral doctor added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add referral doctor');
    },
  });

  const updateDoctor = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ReferralDoctor> & { id: string }) => {
      const { data } = await apiClient.put(`/referral-doctors/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-doctors'] });
      toast.success('Referral doctor updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update referral doctor');
    },
  });

  return {
    getDoctors,
    createDoctor,
    updateDoctor,
  };
};
