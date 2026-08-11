import * as React from 'react';
import { Dialog } from '../../../../../components/ui/dialog';
import { DoctorForm } from './DoctorForm';
import { ReferralDoctor } from '../../../../../types/mdm.types';

interface DoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: ReferralDoctor | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function DoctorDialog({ isOpen, onClose, doctor, onSubmit, isSubmitting }: DoctorDialogProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={doctor ? 'Edit Referral Doctor' : 'Register Referral Doctor'}
      description={doctor ? `Update details for Dr. ${doctor.firstName} ${doctor.lastName}` : 'Add a new referral doctor to the network.'}
      className="max-w-2xl"
    >
      <DoctorForm 
        doctor={doctor} 
        onSubmit={onSubmit} 
        onCancel={onClose} 
        isSubmitting={isSubmitting} 
      />
    </Dialog>
  );
}
