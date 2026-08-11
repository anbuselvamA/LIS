'use client';

import * as React from 'react';
import { useUsers } from '../../../../hooks/useUsers';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { UserFilters } from './components/UserFilters';
import { UserDialog } from './components/UserDialog';
import { ConfirmDialog } from '../../../../components/ui/confirm-dialog';
import { User } from '../../../../types/mdm.types';

export default function UsersPage() {
  const { getUsers, createUser, updateRole, updateStatus } = useUsers();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ role: '', status: '' });
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [userToToggle, setUserToToggle] = React.useState<User | null>(null);

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!getUsers.data) return [];
    
    return getUsers.data.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filters.role ? user.role === filters.role : true;
      const matchesStatus = filters.status 
        ? (filters.status === 'active' ? user.isActive : !user.isActive) 
        : true;
        
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [getUsers.data, searchTerm, filters]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Handlers
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedUser(null), 200);
  };

  const handleSubmitForm = async (data: any) => {
    if (selectedUser) {
      await updateRole.mutateAsync({ id: selectedUser.id, role: data.role });
    } else {
      await createUser.mutateAsync(data);
    }
    handleCloseDialog();
  };

  const handleConfirmToggle = async () => {
    if (userToToggle) {
      await updateStatus.mutateAsync({ 
        id: userToToggle.id, 
        isActive: !userToToggle.isActive 
      });
      setIsConfirmOpen(false);
      setUserToToggle(null);
    }
  };

  const columns = React.useMemo(
    () => getColumns(handleEdit, handleToggleStatus),
    []
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
      <PageHeader 
        title="System Users" 
        description="Manage enterprise users, roles, and system access."
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/dashboard/admin' },
          { label: 'System Users' }
        ]}
      />
      
      <Toolbar 
        onSearch={setSearchTerm}
        hasFilters
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
        onAdd={() => {
          setSelectedUser(null);
          setIsDialogOpen(true);
        }}
        addLabel="Add User"
      />
      
      <UserFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClear={() => setFilters({ role: '', status: '' })}
      />
      
      <DataTable 
        data={paginatedData}
        columns={columns}
        isLoading={getUsers.isLoading}
        page={page}
        pageSize={pageSize}
        totalCount={filteredData.length}
        onPageChange={setPage}
        onRefresh={() => getUsers.refetch()}
      />
      
      <UserDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
        onSubmit={handleSubmitForm}
        isSubmitting={createUser.isPending || updateRole.isPending}
      />
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmToggle}
        title={userToToggle?.isActive ? 'Deactivate User' : 'Activate User'}
        description={`Are you sure you want to ${userToToggle?.isActive ? 'deactivate' : 'activate'} ${userToToggle?.email}? They will ${userToToggle?.isActive ? 'lose' : 'regain'} access to the system.`}
        confirmText={userToToggle?.isActive ? 'Deactivate' : 'Activate'}
        isDestructive={userToToggle?.isActive}
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
