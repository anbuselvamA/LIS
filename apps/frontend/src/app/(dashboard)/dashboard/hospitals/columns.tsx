import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { ReferralHospital } from '../../../../types/mdm.types';
import { StatusBadge } from '../../../../components/ui/status-badge';
import { Button } from '../../../../components/ui/button';
import { Edit2, ShieldAlert } from 'lucide-react';

export const getColumns = (
  onEdit: (hospital: ReferralHospital) => void,
  onToggleStatus: (hospital: ReferralHospital) => void
): ColumnDef<ReferralHospital>[] => [
  {
    key: 'hospitalCode',
    header: 'Hospital Code',
    cell: (row) => <span className="font-semibold text-gray-900">{row.hospitalCode}</span>,
  },
  {
    key: 'name',
    header: 'Hospital Name',
    cell: (row) => <span className="font-medium text-gray-700">{row.name}</span>,
  },
  {
    key: 'contactEmail',
    header: 'Email',
    cell: (row) => <span className="text-gray-600">{row.contactEmail || '-'}</span>,
  },
  {
    key: 'contactPhone',
    header: 'Phone',
    cell: (row) => <span className="text-gray-600">{row.contactPhone || '-'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.isActive} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (row) => (
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(row)}
          className="h-8 w-8 p-0"
          title="Edit Hospital"
        >
          <Edit2 className="h-4 w-4 text-gray-500 hover:text-blue-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleStatus(row)}
          className="h-8 w-8 p-0"
          title={row.isActive ? 'Deactivate Hospital' : 'Activate Hospital'}
        >
          <ShieldAlert className={`h-4 w-4 ${row.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`} />
        </Button>
      </div>
    ),
  }
];
