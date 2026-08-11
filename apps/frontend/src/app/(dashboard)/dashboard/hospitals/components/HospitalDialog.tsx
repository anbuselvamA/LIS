import * as React from 'react';
import { Dialog } from '../../../../../components/ui/dialog';
import { HospitalForm } from './HospitalForm';
import { ReferralHospital } from '../../../../../types/mdm.types';

interface HospitalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: ReferralHospital | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function HospitalDialog({ isOpen, onClose, hospital, onSubmit, isSubmitting }: HospitalDialogProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={hospital ? 'Edit Referral Hospital' : 'Register Referral Hospital'}
      description={hospital ? `Update details for ${hospital.name}` : 'Add a new referral hospital to the network.'}
      className="max-w-2xl"
    >
      <HospitalForm 
        hospital={hospital} 
        onSubmit={onSubmit} 
        onCancel={onClose} 
        isSubmitting={isSubmitting} 
      />
    </Dialog>
  );
}
