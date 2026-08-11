import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center px-4 sm:px-6">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-6 ${isDestructive ? 'bg-red-50' : 'bg-blue-50'}`}>
          <AlertTriangle className={`h-8 w-8 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mb-8 text-sm text-gray-500 max-w-sm">
          {description}
        </p>
        
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'destructive' : 'default'} 
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
