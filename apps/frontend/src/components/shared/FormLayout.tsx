import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface FormLayoutProps {
  children: React.ReactNode;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function FormLayout({
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  className
}: FormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col space-y-6", className)}>
      <div className="space-y-4">
        {children}
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {cancelLabel}
        </Button>
        <Button 
          type="submit" 
          isLoading={isSubmitting}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
