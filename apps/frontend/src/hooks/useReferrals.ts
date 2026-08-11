import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

export interface CreateReferralRequestDto {
  referralDoctorId: string;
  patientId?: string;
  patientDetails?: any;
  requestedTestIds?: string[];
  priority?: string;
  reason?: string;
  notes?: string;
}

export interface UpdateReferralStatusDto {
  status: string;
}

export const useReferrals = () => {
  const queryClient = useQueryClient();

  const getReferrals = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const response = await apiClient.get('/referrals');
      return response.data;
    },
    // The requirement mentions 5-10s polling for real-time updates.
    refetchInterval: 10000, 
  });

  const createReferral = useMutation({
    mutationFn: async (data: CreateReferralRequestDto) => {
      const response = await apiClient.post('/referrals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'referral'] });
    },
  });

  const updateReferralStatus = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReferralStatusDto }) => {
      const response = await apiClient.patch(`/referrals/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['referral-dashboard'] });
    },
  });

  return {
    getReferrals,
    createReferral,
    updateReferralStatus,
  };
};

export const useReferral = (idOrNumber: string) =>
  useQuery({
    queryKey: ['referrals', idOrNumber],
    queryFn: async () => {
      const response = await apiClient.get(`/referrals/${idOrNumber}`);
      return response.data;
    },
    enabled: !!idOrNumber,
  });
