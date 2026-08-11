import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { Test } from '../types/mdm.types';
import toast from 'react-hot-toast';

export const useTests = () => {
  const queryClient = useQueryClient();

  const getTests = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data } = await apiClient.get<Test[]>('/tests');
      return data;
    },
  });

  const createTest = useMutation({
    mutationFn: async (newTest: Partial<Test>) => {
      const { data } = await apiClient.post('/tests', newTest);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add test');
    },
  });

  const updateTest = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Test> & { id: string }) => {
      const { data } = await apiClient.put(`/tests/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update test');
    },
  });

  const deleteTest = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tests/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove test');
    },
  });

  return {
    getTests,
    createTest,
    updateTest,
    deleteTest,
  };
};
