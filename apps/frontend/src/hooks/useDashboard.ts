import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

const fetchAdminDashboard = async () => {
  const response = await apiClient.get('/dashboard/admin');
  return response.data;
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: fetchAdminDashboard,
    refetchInterval: 5000,
  });
};

const fetchReceptionDashboard = async () => {
  const response = await apiClient.get('/dashboard/reception');
  return response.data;
};

export const useReceptionDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'reception'],
    queryFn: fetchReceptionDashboard,
    refetchInterval: 5000,
  });
};

const fetchLabDashboard = async () => {
  const response = await apiClient.get('/dashboard/lab');
  return response.data;
};

export const useLabDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'lab'],
    queryFn: fetchLabDashboard,
    refetchInterval: 5000,
  });
};

const fetchDoctorDashboard = async () => {
  const response = await apiClient.get('/dashboard/doctor');
  return response.data;
};

export const useDoctorDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'doctor'],
    queryFn: fetchDoctorDashboard,
    refetchInterval: 5000, // Poll every 5 seconds for Real-Time KPI updates
  });
};

const fetchReferralDashboard = async () => {
  const response = await apiClient.get('/dashboard/referral');
  return response.data;
};

export const useReferralDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'referral'],
    queryFn: fetchReferralDashboard,
    refetchInterval: 5000,
  });
};
