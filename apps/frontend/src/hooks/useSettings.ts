import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get('/settings');
      return response.data;
    },
    // We only need to block execution if we strictly want it authenticated, 
    // but settings might be needed globally for unauthenticated views (like shared reports)
    // For now, let's just fetch it. The backend allows GET /settings for all authenticated users.
    enabled: !!user,
  });

  const auditQuery = useQuery({
    queryKey: ['settings', 'audit'],
    queryFn: async () => {
      const response = await apiClient.get('/settings/audit');
      return response.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const statusQuery = useQuery({
    queryKey: ['settings', 'status'],
    queryFn: async () => {
      const response = await apiClient.get('/settings/status');
      return response.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const updateSettings = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await apiClient.put(`/settings/${key}`, value);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'audit'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Unable to save settings';
      toast.error(msg);
    }
  });

  return {
    settingsQuery,
    auditQuery,
    statusQuery,
    updateSettings,
  };
};
