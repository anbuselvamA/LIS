'use client';

import * as React from 'react';
import { useDoctors } from '../../../../hooks/useDoctors';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { DoctorFilters } from './components/DoctorFilters';
import { DoctorDialog } from './components/DoctorDialog';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { ReferralDoctor } from '../../../../types/mdm.types';
import { useAuth } from '../../../../context/AuthContext';

export default function DoctorsPage() {
  const { getDoctors, createDoctor, updateDoctor } = useDoctors();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ hospitalId: '', status: '' });
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<ReferralDoctor | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [doctorToToggle, setDoctorToToggle] = React.useState<ReferralDoctor | null>(null);

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!getDoctors.data) return [];
    
    return getDoctors.data.filter(doctor => {
      const docCode = doctor.doctorCode || '';
      const fName = doctor.firstName || '';
      const lName = doctor.lastName || '';
      
      const matchesSearch = 
        docCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        fName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHospital = filters.hospitalId ? doctor.hospitalId === filters.hospitalId : true;
      
      const isActive = doctor.user?.isActive ?? doctor.isActive ?? true;
      const matchesStatus = filters.status 
        ? (filters.status === 'active' ? isActive : !isActive) 
        : true;
        
      return matchesSearch && matchesHospital && matchesStatus;
    });
  }, [getDoctors.data, searchTerm, filters]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Handlers
  const handleEdit = (doctor: ReferralDoctor) => {
    setSelectedDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (doctor: ReferralDoctor) => {
    setDoctorToToggle(doctor);
    setIsConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedDoctor(null), 200);
  };

  const handleSubmitForm = async (data: any) => {
    if (selectedDoctor) {
      await updateDoctor.mutateAsync({ id: selectedDoctor.id, ...data });
    } else {
      await createDoctor.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleConfirmToggle = async () => {
    if (doctorToToggle) {
      const currentIsActive = doctorToToggle.user?.isActive ?? doctorToToggle.isActive ?? true;
      await updateDoctor.mutateAsync({ 
        id: doctorToToggle.id, 
        isActive: !currentIsActive // We pass isActive true/false based on toggle
      });
      setIsConfirmOpen(false);
      setDoctorToToggle(null);
    }
  };

  const columns = React.useMemo(
    () => getColumns(handleEdit, handleToggleStatus),
    []
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
      <PageHeader 
        title="Referral Doctors" 
        description="Manage doctors associated with referral hospitals."
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/dashboard/admin' },
          { label: 'Referral Doctors' }
        ]}
      />
      
      <Toolbar 
        onSearch={setSearchTerm}
        hasFilters
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        onAdd={isAdmin ? () => {
          setSelectedDoctor(null);
          setIsDialogOpen(true);
        } : undefined}
        addLabel="Register Doctor"
      />
      
      <DoctorFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClear={() => setFilters({ hospitalId: '', status: '' })}
      />
      
      <DataTable 
        data={paginatedData}
        columns={columns}
        isLoading={getDoctors.isLoading}
        isError={getDoctors.isError}
        page={page}
        pageSize={pageSize}
        totalCount={filteredData.length}
        onPageChange={setPage}
        onRefresh={() => getDoctors.refetch()}
      />
      
      <DoctorDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        doctor={selectedDoctor}
        onSubmit={handleSubmitForm}
        isSubmitting={createDoctor.isPending || updateDoctor.isPending}
      />
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={(doctorToToggle?.user?.isActive ?? doctorToToggle?.isActive) ? 'Deactivate Doctor' : 'Activate Doctor'}
        description={`Are you sure you want to ${(doctorToToggle?.user?.isActive ?? doctorToToggle?.isActive) ? 'deactivate' : 'activate'} Dr. ${doctorToToggle?.firstName} ${doctorToToggle?.lastName}? This will toggle their access to the system.`}
        confirmText={(doctorToToggle?.user?.isActive ?? doctorToToggle?.isActive) ? 'Deactivate' : 'Activate'}
        isDestructive={(doctorToToggle?.user?.isActive ?? doctorToToggle?.isActive) ?? false}
        isLoading={updateDoctor.isPending}
      />
    </div>
  );
}
