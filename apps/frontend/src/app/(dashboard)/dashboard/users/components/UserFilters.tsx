import * as React from 'react';
import { Select } from '../../../../../components/ui/select';
import { FilterPanel } from '../../../../../components/shared/FilterPanel';
import { Role } from '../../../../../types/auth.types';

interface UserFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    role: string;
    status: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function UserFilters({ isOpen, onClose, filters, onChange, onClear }: UserFiltersProps) {
  const hasActiveFilters = filters.role !== '' || filters.status !== '';

  return (
    <FilterPanel 
      isOpen={isOpen} 
      onClose={onClose} 
      onClearFilters={onClear}
      hasActiveFilters={hasActiveFilters}
    >
      <Select 
        label="Role" 
        value={filters.role} 
        onChange={(e) => onChange('role', e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="RECEPTIONIST">Receptionist</option>
        <option value="LAB_TECHNICIAN">Lab Technician</option>
        <option value="DOCTOR">Doctor</option>
        <option value="REFERRAL_DOCTOR">Referral Doctor</option>
      </Select>
      
      <Select 
        label="Status" 
        value={filters.status} 
        onChange={(e) => onChange('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
    </FilterPanel>
  );
}
