import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { TestOrder, CreateTestOrderFormData } from '../types/order.types';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const getOrders = useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<TestOrder[]> => {
      const response = await apiClient.get('/orders');
      return response.data;
    },
  });

  const createOrder = useMutation({
    mutationFn: async (data: CreateTestOrderFormData) => {
      const response = await apiClient.post('/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'reception'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'lab'] });
    },
  });

  return {
    getOrders,
    createOrder,
  };
};

// Separate hook to fetch a single order by ID
export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: async (): Promise<TestOrder> => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
