import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { ReferralDoctor } from '../../../../types/mdm.types';
import { StatusBadge } from '../../../../components/ui/status-badge';
import { Button } from '../../../../components/ui/button';
import { Edit2, ShieldAlert, UserCheck, Stethoscope, Phone, Building2 } from 'lucide-react';

export const getColumns = (
  onEdit: (doctor: ReferralDoctor) => void,
  onToggleStatus: (doctor: ReferralDoctor) => void
): ColumnDef<ReferralDoctor>[] => [
  {
    key: 'name',
    header: 'Doctor Info',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
          <Stethoscope className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">Dr. {row.firstName} {row.lastName}</span>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{row.doctorCode}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'specialization',
    header: 'Specialization',
    cell: (row) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        {row.specialization || 'General Practice'}
      </span>
    ),
  },
  {
    key: 'contact',
    header: 'Contact',
    cell: (row) => (
      <div className="flex flex-col space-y-1">
        <span className="text-sm text-slate-700 flex items-center">
          <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
          {row.phone || 'N/A'}
        </span>
        <span className="text-xs text-slate-500">
          {row.user?.email || 'No email provided'}
        </span>
      </div>
    ),
  },
  {
    key: 'hospital',
    header: 'Hospital / Clinic',
    cell: (row) => (
      <div className="flex items-center text-sm text-slate-600">
        <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
        {row.hospital?.name || row.hospitalId || 'Independent'}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'System Access',
    cell: (row) => <StatusBadge status={row.user?.isActive ?? row.isActive ?? true} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (row) => (
      <div className="flex items-center justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(row)}
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Edit Doctor"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleStatus(row)}
          className={`h-8 w-8 ${(row.user?.isActive ?? row.isActive) ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
          title={(row.user?.isActive ?? row.isActive) ? 'Deactivate Doctor' : 'Activate Doctor'}
        >
          <ShieldAlert className="h-4 w-4" />
        </Button>
      </div>
    ),
  }
];
