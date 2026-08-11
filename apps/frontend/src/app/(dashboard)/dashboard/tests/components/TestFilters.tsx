import * as React from 'react';
import { Select } from '../../../../../components/ui/select';
import { FilterPanel } from '../../../../../components/shared/FilterPanel';

interface TestFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    specimenType: string;
    status: string;
  };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function TestFilters({ isOpen, onClose, filters, onChange, onClear }: TestFiltersProps) {
  const hasActiveFilters = filters.specimenType !== '' || filters.status !== '';

  return (
    <FilterPanel 
      isOpen={isOpen} 
      onClose={onClose} 
      onClearFilters={onClear}
      hasActiveFilters={hasActiveFilters}
    >
      <Select 
        label="Specimen Type" 
        value={filters.specimenType} 
        onChange={(e) => onChange('specimenType', e.target.value)}
      >
        <option value="">All Specimens</option>
        <option value="BLOOD">Blood</option>
        <option value="SERUM">Serum</option>
        <option value="PLASMA">Plasma</option>
        <option value="URINE">Urine</option>
        <option value="STOOL">Stool</option>
        <option value="SALIVA">Saliva</option>
        <option value="SWAB">Swab</option>
        <option value="TISSUE">Tissue</option>
        <option value="OTHER">Other</option>
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
