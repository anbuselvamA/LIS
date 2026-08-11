'use client';

import * as React from 'react';
import { useHospitals } from '../../../../hooks/useHospitals';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { HospitalFilters } from './components/HospitalFilters';
import { HospitalDialog } from './components/HospitalDialog';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { ReferralHospital } from '../../../../types/mdm.types';

export default function HospitalsPage() {
  const { getHospitals, createHospital, updateHospital } = useHospitals();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ status: '' });
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedHospital, setSelectedHospital] = React.useState<ReferralHospital | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [hospitalToToggle, setHospitalToToggle] = React.useState<ReferralHospital | null>(null);

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!getHospitals.data) return [];
    
    return getHospitals.data.filter(hospital => {
      const matchesSearch = 
        hospital.hospitalCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status 
        ? (filters.status === 'active' ? hospital.isActive : !hospital.isActive) 
        : true;
        
      return matchesSearch && matchesStatus;
    });
  }, [getHospitals.data, searchTerm, filters]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Handlers
  const handleEdit = (hospital: ReferralHospital) => {
    setSelectedHospital(hospital);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (hospital: ReferralHospital) => {
    setHospitalToToggle(hospital);
    setIsConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedHospital(null), 200);
  };

  const handleSubmitForm = async (data: any) => {
    if (selectedHospital) {
      await updateHospital.mutateAsync({ id: selectedHospital.id, ...data });
    } else {
      await createHospital.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleConfirmToggle = async () => {
    if (hospitalToToggle) {
      await updateHospital.mutateAsync({ 
        id: hospitalToToggle.id, 
        isActive: !hospitalToToggle.isActive 
      });
      setIsConfirmOpen(false);
      setHospitalToToggle(null);
    }
  };

  const columns = React.useMemo(
    () => getColumns(handleEdit, handleToggleStatus),
    []
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
      <PageHeader 
        title="Referral Hospitals" 
        description="Manage the network of referring hospitals and clinics."
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/dashboard/admin' },
          { label: 'Referral Hospitals' }
        ]}
      />
      
      <Toolbar 
        onSearch={setSearchTerm}
        hasFilters
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        onAdd={() => {
          setSelectedHospital(null);
          setIsDialogOpen(true);
        }}
        addLabel="Register Hospital"
      />
      
      <HospitalFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClear={() => setFilters({ status: '' })}
      />
      
      <DataTable 
        data={paginatedData}
        columns={columns}
        isLoading={getHospitals.isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={filteredData.length}
        onPageChange={setPage}
        onRefresh={() => getHospitals.refetch()}
      />
      
      <HospitalDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        hospital={selectedHospital}
        onSubmit={handleSubmitForm}
        isSubmitting={createHospital.isPending || updateHospital.isPending}
      />
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={hospitalToToggle?.isActive ? 'Deactivate Hospital' : 'Activate Hospital'}
        description={`Are you sure you want to ${hospitalToToggle?.isActive ? 'deactivate' : 'activate'} ${hospitalToToggle?.name}?`}
        confirmText={hospitalToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={hospitalToToggle?.isActive}
        isLoading={updateHospital.isPending}
      />
    </div>
  );
}
