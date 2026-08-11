'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '../../../../hooks/useOrders';
import { useAuth } from '../../../../context/AuthContext';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { Toolbar } from '../../../../components/shared/Toolbar';
import { DataTable } from '../../../../components/shared/DataTable';
import { getColumns } from './columns';
import { ClipboardList } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { getOrders } = useOrders();
  const { user } = useAuth();
  
  // Local state for UI
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!getOrders.data) return [];
    
    return getOrders.data.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const patientName = `${order.patient?.firstName} ${order.patient?.lastName}`.toLowerCase();
      
      return (
        order.orderNumber.toLowerCase().includes(searchLower) || 
        patientName.includes(searchLower)
      );
    });
  }, [getOrders.data, searchTerm]);

  // Paginate Data
  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const handleAdd = () => {
    router.push('/dashboard/orders/new');
  };

  const columns = React.useMemo(() => getColumns(), []);
  
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      <PageHeader 
        title="Test Orders" 
        description="Manage patient test orders and sample collection."
      />
      
      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Toolbar 
          onAdd={isAdmin ? undefined : handleAdd} 
          addLabel="Create Order"
          onSearch={(val) => { setSearchTerm(val); setPage(1); }}
          searchPlaceholder="Search by Order # or Patient Name..."
        />

        <div className="flex-1 overflow-hidden p-6 pt-0">
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={getOrders.isLoading}
            page={page}
            pageSize={pageSize}
            totalCount={filteredData.length}
            onPageChange={setPage}
            emptyTitle="No Orders Found"
            emptyDescription={isAdmin ? "No orders are currently present in the system." : "Click 'Create Order' to start a new test order."}
          />
        </div>
      </div>
    </div>
  );
}
