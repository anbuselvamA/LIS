import * as React from 'react';
import { ColumnDef } from '../../../../components/shared/DataTable';
import { Patient } from '../../../../types/patient.types';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Edit2, Eye, Activity } from 'lucide-react';
import Link from 'next/link';

interface GetPatientColumnsProps {
  onEdit?: (patient: Patient) => void;
}

export const getColumns = ({ onEdit }: GetPatientColumnsProps): ColumnDef<Patient>[] => [
  {
    key: 'mrn',
    header: 'MRN',
    cell: (patient) => (
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-gray-900">{patient.mrn}</span>
      </div>
    ),
  },
  {
    key: 'firstName',
    header: 'Patient Name',
    cell: (patient) => (
      <span className="font-medium text-gray-900">
        {patient.firstName} {patient.lastName}
      </span>
    ),
  },
  {
    key: 'gender',
    header: 'Gender',
    cell: (patient) => {
      const g = patient.gender;
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600">
          {g.charAt(0) + g.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    key: 'dateOfBirth',
    header: 'Date of Birth',
    cell: (patient) => {
      if (!patient.dateOfBirth) return <span className="text-gray-400">N/A</span>;
      return new Date(patient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
  },
  {
    key: 'phone',
    header: 'Contact',
    cell: (patient) => {
      return (
        <div className="flex flex-col">
          <span className="text-gray-700">{patient.phone || 'No phone'}</span>
          <span className="text-gray-500 text-xs">{patient.email}</span>
        </div>
      );
    },
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (patient) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/patients/${patient.id}`}>
            <Button variant="outline" size="sm" className="h-8">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Profile
            </Button>
          </Link>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  }
];

