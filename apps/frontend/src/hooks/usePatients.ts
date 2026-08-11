import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';
import { Patient, PatientFormData } from '../types/patient.types';

export const usePatients = (searchQuery?: string) => {
  const queryClient = useQueryClient();

  const patientsQuery = useQuery({
    queryKey: ['patients', searchQuery],
    queryFn: async (): Promise<Patient[]> => {
      const url = searchQuery ? `/patients/search?q=${encodeURIComponent(searchQuery)}` : '/patients';
      const response = await apiClient.get(url);
      return response.data;
    },
  });

  const createPatient = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const response = await apiClient.post('/patients', {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'reception'] });
    },
  });

  const updatePatient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PatientFormData> }) => {
      const response = await apiClient.put(`/patients/${id}`, {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'reception'] });
    },
  });

  return {
    patientsQuery,
    createPatient,
    updatePatient,
  };
};

// Separate hook to fetch a single patient by ID
export const usePatient = (id: string) =>
  useQuery({
    queryKey: ['patients', id],
    queryFn: async (): Promise<Patient> => {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
