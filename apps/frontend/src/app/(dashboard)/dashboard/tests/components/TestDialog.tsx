import * as React from 'react';
import { Dialog } from '../../../../../components/ui/dialog';
import { TestForm } from './TestForm';
import { Test } from '../../../../../types/mdm.types';

interface TestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function TestDialog({ isOpen, onClose, test, onSubmit, isSubmitting }: TestDialogProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={test ? 'Edit Test' : 'Add New Test'}
      description={test ? `Update details for test code ${test.testCode}` : 'Add a new test to the enterprise catalogue.'}
      className="max-w-2xl"
    >
      <TestForm 
        test={test} 
        onSubmit={onSubmit} 
        onCancel={onClose} 
        isSubmitting={isSubmitting} 
      />
    </Dialog>
  );
}
