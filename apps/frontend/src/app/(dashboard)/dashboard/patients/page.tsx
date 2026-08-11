'use client';

import * as React from 'react';
import { usePatients } from '../../../../hooks/usePatients';
import { useAuth } from '../../../../context/AuthContext';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { PatientDialog } from './components/PatientDialog';
import { Patient } from '../../../../types/patient.types';

export default function PatientsPage() {
  const { patientsQuery } = usePatients();
  const { user } = useAuth();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!patientsQuery.data) return [];
    
    return patientsQuery.data.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.mrn.toLowerCase().includes(searchLower) || 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        (patient.phone && patient.phone.toLowerCase().includes(searchLower))
      );
    });
  }, [patientsQuery.data, searchTerm]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    setIsDialogOpen(true);
  };

  const isReadOnly = user?.role === 'ADMIN' || user?.role === 'DOCTOR';
  
  // Only provide onEdit to columns if user is not read-only
  const columns = React.useMemo(() => getColumns({ onEdit: isReadOnly ? undefined : handleEdit }), [isReadOnly]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      <PageHeader 
        title="Patient Management" 
        description="Register and manage patient demographic information."
      />
      
      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Toolbar 
          onAdd={isReadOnly ? undefined : handleAdd} 
          addLabel="Register Patient"
          onSearch={(val) => { setSearchTerm(val); setPage(1); }}
          searchPlaceholder="Search by MRN, Name, Phone..."
        />

        <div className="flex-1 overflow-hidden p-6 pt-0">
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={patientsQuery.isLoading}
            page={page}
            pageSize={pageSize}
            totalCount={filteredData.length}
            onPageChange={setPage}
            emptyTitle="No Patients Found"
            emptyDescription={isReadOnly ? "No patients are currently registered in the system." : "Click 'Register Patient' to add a new patient."}
          />
        </div>
      </div>

      <PatientDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        patient={selectedPatient}
      />
    </div>
  );
}
