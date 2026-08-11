import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { Result, CreateResultDto } from '../types/result.types';
import { useAuth } from '../context/AuthContext';

export const useResults = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role;

  const resultsQuery = useQuery({
    queryKey: ['results'],
    queryFn: async (): Promise<Result[]> => {
      const response = await apiClient.get('/results');
      return response.data;
    },
    enabled: !!user && (role === 'ADMIN' || role === 'LAB_TECHNICIAN'),
  });

  const pendingResultsQuery = useQuery({
    queryKey: ['results', 'pending'],
    queryFn: async (): Promise<Result[]> => {
      const response = await apiClient.get('/results/pending');
      return response.data;
    },
    enabled: !!user && (role === 'ADMIN' || role === 'DOCTOR'),
    refetchInterval: 5000, // Poll every 5 seconds for Real-Time Doctor Queue
  });

  const verifiedResultsQuery = useQuery({
    queryKey: ['results', 'verified'],
    queryFn: async () => {
      const response = await apiClient.get<Result[]>('/results/verified');
      return response.data;
    }
  });

  const readyResultsQuery = useQuery({
    queryKey: ['results', 'ready'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/results/ready');
      return response.data;
    },
    enabled: !!user && (role === 'ADMIN' || role === 'RECEPTIONIST'),
    refetchInterval: 10000, // Poll every 10 seconds for Reports and Sidebar Badges
  });

  const referralResultsQuery = useQuery({
    queryKey: ['results', 'referral'],
    queryFn: async () => {
      const response = await apiClient.get<Result[]>('/results/referral');
      return response.data;
    },
    enabled: !!user && role === 'REFERRAL_DOCTOR',
    refetchInterval: 10000,
  });

  const createResult = useMutation({
    mutationFn: async (data: CreateResultDto) => {
      const response = await apiClient.post('/results', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'lab'] });
    },
  });

  const verifyResult = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/results/${id}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'reception'] });
    },
  });

  const updateResult = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Result> }) => {
      const response = await apiClient.put(`/results/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'doctor'] });
    },
  });

  const rejectResult = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.put(`/results/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['results', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
  });

  const markReportViewed = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post(`/results/ready/${orderId}/view`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', 'ready'] });
    },
  });

  return {
    resultsQuery,
    pendingResultsQuery,
    verifiedResultsQuery,
    readyResultsQuery,
    referralResultsQuery,
    createResult,
    verifyResult,
    rejectResult,
    updateResult,
    markReportViewed,
  };
};

export const useResult = (id: string) =>
  useQuery({
    queryKey: ['results', id],
    queryFn: async (): Promise<Result> => {
      const response = await apiClient.get(`/results/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
