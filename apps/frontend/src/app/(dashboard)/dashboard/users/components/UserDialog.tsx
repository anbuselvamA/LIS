import * as React from 'react';
import { Dialog } from '../../../../../components/ui/dialog';
import { UserForm } from './UserForm';
import { User } from '../../../../../types/mdm.types';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function UserDialog({ isOpen, onClose, user, onSubmit, isSubmitting }: UserDialogProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={user ? 'Edit User Role' : 'Create New User'}
      description={user ? `Update system role for ${user.email}` : 'Add a new user to the enterprise system.'}
    >
      <UserForm 
        user={user} 
        onSubmit={onSubmit} 
        onCancel={onClose} 
        isSubmitting={isSubmitting} 
      />
    </Dialog>
  );
}
