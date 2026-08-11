import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  className,
}: DrawerProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'inset-y-0 right-0 h-full w-full sm:max-w-md border-l data-[state=open]:slide-in-from-right',
    left: 'inset-y-0 left-0 h-full w-full sm:max-w-md border-r data-[state=open]:slide-in-from-left',
    top: 'inset-x-0 top-0 w-full h-auto max-h-[80vh] border-b data-[state=open]:slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 w-full h-auto max-h-[80vh] border-t data-[state=open]:slide-in-from-bottom',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-white shadow-2xl transition ease-in-out duration-300 animate-in',
          positionClasses[position],
          className
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex flex-col space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 opacity-70 transition-opacity hover:opacity-100 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <X className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
