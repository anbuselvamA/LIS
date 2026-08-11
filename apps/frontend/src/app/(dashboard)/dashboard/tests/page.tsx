'use client';

import * as React from 'react';
import { useTests } from '../../../../hooks/useTests';
import { useAuth } from '../../../../context/AuthContext';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { TestFilters } from './components/TestFilters';
import { TestDialog } from './components/TestDialog';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { Test } from '../../../../types/mdm.types';

export default function TestsPage() {
  const { getTests, createTest, updateTest, deleteTest } = useTests();
  const { user } = useAuth();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ specimenType: '', status: '' });
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTest, setSelectedTest] = React.useState<Test | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [testToToggle, setTestToToggle] = React.useState<Test | null>(null);

  const isLabTech = user?.role === 'LAB_TECHNICIAN';

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!getTests.data) return [];
    
    return getTests.data.filter(test => {
      const matchesSearch = 
        test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        test.testName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecimen = filters.specimenType ? test.specimenType === filters.specimenType : true;
      const matchesStatus = filters.status 
        ? (filters.status === 'active' ? test.isActive : !test.isActive) 
        : true;
        
      return matchesSearch && matchesSpecimen && matchesStatus;
    });
  }, [getTests.data, searchTerm, filters]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Handlers
  const handleEdit = (test: Test) => {
    setSelectedTest(test);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (test: Test) => {
    setTestToToggle(test);
    setIsConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedTest(null), 200);
  };

  const handleSubmitForm = async (data: any) => {
    if (selectedTest) {
      await updateTest.mutateAsync({ id: selectedTest.id, ...data });
    } else {
      await createTest.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleConfirmToggle = async () => {
    if (testToToggle) {
      await updateTest.mutateAsync({ 
        id: testToToggle.id, 
        isActive: !testToToggle.isActive 
      });
      setIsConfirmOpen(false);
      setTestToToggle(null);
    }
  };

  const columns = React.useMemo(
    () => getColumns(
      isLabTech ? undefined : handleEdit, 
      isLabTech ? undefined : handleToggleStatus
    ),
    [isLabTech]
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
      <PageHeader 
        title={isLabTech ? "Test Catalogue (Read Only)" : "Test Catalogue"} 
        description="Manage laboratory tests, prices, and turnaround times."
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/dashboard/admin' },
          { label: 'Test Catalogue' }
        ]}
      />
      
      <Toolbar 
        onSearch={setSearchTerm}
        hasFilters
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        onAdd={isLabTech ? undefined : () => {
          setSelectedTest(null);
          setIsDialogOpen(true);
        }}
        addLabel="Add Test"
      />
      
      <TestFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClear={() => setFilters({ specimenType: '', status: '' })}
      />
      
      <DataTable 
        data={paginatedData}
        columns={columns}
        isLoading={getTests.isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={filteredData.length}
        onPageChange={setPage}
        onRefresh={() => getTests.refetch()}
      />
      
      <TestDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        test={selectedTest}
        onSubmit={handleSubmitForm}
        isSubmitting={createTest.isPending || updateTest.isPending}
      />
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={testToToggle?.isActive ? 'Deactivate Test' : 'Activate Test'}
        description={`Are you sure you want to ${testToToggle?.isActive ? 'deactivate' : 'activate'} ${testToToggle?.testCode}? This will affect its availability for new orders.`}
        confirmText={testToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={testToToggle?.isActive}
        isLoading={updateTest.isPending}
      />
    </div>
  );
}
