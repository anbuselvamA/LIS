import * as React from 'react';
import { Select } from '../../../../../components/ui/select';
import { FilterPanel } from '../../../../../components/shared/FilterPanel';

interface HospitalFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function HospitalFilters({ isOpen, onClose, filters, onChange, onClear }: HospitalFiltersProps) {
  const hasActiveFilters = filters.status !== '';

  return (
    <FilterPanel 
      isOpen={isOpen} 
      onClose={onClose} 
      onClearFilters={onClear}
      hasActiveFilters={hasActiveFilters}
    >
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
