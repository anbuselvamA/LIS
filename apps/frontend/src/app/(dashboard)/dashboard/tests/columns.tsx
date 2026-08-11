import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { Test } from '../../../../types/mdm.types';
import { StatusBadge } from '../../../../components/ui/status-badge';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Edit2, ShieldAlert, TestTube, Clock, DollarSign } from 'lucide-react';

export const getColumns = (
  onEdit?: (test: Test) => void,
  onToggleStatus?: (test: Test) => void
): ColumnDef<Test>[] => [
  {
    key: 'testCode',
    header: 'Test Details',
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <TestTube className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.testName}</span>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">
            {row.testCode}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: 'specimenType',
    header: 'Specimen',
    cell: (row) => (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wider text-[10px] font-semibold">
        {row.specimenType.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    key: 'price',
    header: 'Price',
    cell: (row) => (
      <div className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
        <DollarSign className="w-3.5 h-3.5 mr-0.5" />
        {row.price.toFixed(2)}
      </div>
    ),
  },
  {
    key: 'tat',
    header: 'Turnaround Time',
    cell: (row) => (
      <div className="flex items-center text-slate-600">
        <Clock className="w-4 h-4 mr-1.5 opacity-70" />
        {row.turnaroundTimeHours} hours
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.isActive} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (row) => {
      if (!onEdit && !onToggleStatus) return null;
      return (
        <div className="flex items-center justify-end space-x-2">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(row)}
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit Test"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onToggleStatus && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleStatus(row)}
              className={`h-8 w-8 ${row.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
              title={row.isActive ? 'Deactivate Test' : 'Activate Test'}
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  }
];

