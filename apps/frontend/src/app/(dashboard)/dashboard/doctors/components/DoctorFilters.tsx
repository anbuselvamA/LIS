import * as React from 'react';
import { Select } from '../../../../../components/ui/select';
import { FilterPanel } from '../../../../../components/shared/FilterPanel';
import { useHospitals } from '../../../../../hooks/useHospitals';

interface DoctorFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    hospitalId: string;
    status: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function DoctorFilters({ isOpen, onClose, filters, onChange, onClear }: DoctorFiltersProps) {
  const hasActiveFilters = filters.hospitalId !== '' || filters.status !== '';
  const { getHospitals } = useHospitals();

  return (
    <FilterPanel 
      isOpen={isOpen} 
      onClose={onClose} 
      onClearFilters={onClear}
      hasActiveFilters={hasActiveFilters}
    >
      <Select 
        label="Hospital" 
        value={filters.hospitalId} 
        onChange={(e) => onChange('hospitalId', e.target.value)}
      >
        <option value="">All Hospitals</option>
        {getHospitals.data?.map(h => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </Select>
      
      <Select 
        label="System Access" 
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
