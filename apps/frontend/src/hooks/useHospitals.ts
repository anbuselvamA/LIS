import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { ReferralHospital } from '../types/mdm.types';
import toast from 'react-hot-toast';

export const useHospitals = () => {
  const queryClient = useQueryClient();

  const getHospitals = useQuery({
    queryKey: ['referral-hospitals'],
    queryFn: async () => {
      const { data } = await apiClient.get<ReferralHospital[]>('/referral-hospitals');
      return data;
    },
  });

  const createHospital = useMutation({
    mutationFn: async (newHospital: Partial<ReferralHospital>) => {
      const { data } = await apiClient.post('/referral-hospitals', newHospital);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-hospitals'] });
      toast.success('Hospital added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add hospital');
    },
  });

  const updateHospital = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ReferralHospital> & { id: string }) => {
      const { data } = await apiClient.put(`/referral-hospitals/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-hospitals'] });
      toast.success('Hospital updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    },
  });

  return {
    getHospitals,
    createHospital,
    updateHospital,
  };
};
