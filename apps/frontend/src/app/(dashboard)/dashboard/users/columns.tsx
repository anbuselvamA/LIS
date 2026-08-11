import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { User } from '../../../../types/mdm.types';
import { StatusBadge } from '../../../../components/ui/status-badge';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Edit2, ShieldAlert, Mail, User as UserIcon, CalendarIcon } from 'lucide-react';

export const getColumns = (
  onEdit: (user: User) => void,
  onToggleStatus: (user: User) => void
): ColumnDef<User>[] => [
  {
    key: 'email',
    header: 'User Account',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
          <UserIcon className="h-5 w-5 text-slate-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.email.split('@')[0]}</span>
          <span className="text-xs text-slate-500 flex items-center">
            <Mail className="w-3 h-3 mr-1" /> {row.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Assigned Role',
    cell: (row) => {
      let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
      if (row.role === 'ADMIN') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      if (row.role === 'LAB_TECHNICIAN') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      if (row.role === 'RECEPTIONIST') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      if (row.role === 'DOCTOR') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      
      return (
        <Badge variant="outline" className={`${badgeColor} uppercase tracking-wider text-[10px] font-semibold`}>
          {row.role.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    key: 'status',
    header: 'Account Status',
    cell: (row) => <StatusBadge status={row.isActive} />,
  },
  {
    key: 'createdAt',
    header: 'Registered On',
    cell: (row) => (
      <div className="flex items-center text-sm text-slate-600">
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
      </div>
    ),
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
          title="Edit Role"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleStatus(row)}
          className={`h-8 w-8 ${row.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
          title={row.isActive ? 'Deactivate User' : 'Activate User'}
        >
          <ShieldAlert className="h-4 w-4" />
        </Button>
      </div>
    ),
  }
];
