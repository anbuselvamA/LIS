import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { Sample, SampleStatus } from '../types/sample.types';

export const useSamples = () => {
  const queryClient = useQueryClient();

  const samplesQuery = useQuery({
    queryKey: ['samples'],
    queryFn: async (): Promise<Sample[]> => {
      const response = await apiClient.get('/samples');
      return response.data;
    },
  });

  const updateSampleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SampleStatus }) => {
      const response = await apiClient.put(`/samples/${id}`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['samples', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'lab'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
  });

  return {
    samplesQuery,
    updateSampleStatus,
  };
};

export const useSample = (id: string) =>
  useQuery({
    queryKey: ['samples', id],
    queryFn: async (): Promise<Sample> => {
      const response = await apiClient.get(`/samples/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
