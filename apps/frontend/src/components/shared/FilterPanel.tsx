import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface FilterPanelProps {
  isOpen: boolean;
  onClose?: () => void;
  onClearFilters?: () => void;
  children: React.ReactNode;
  className?: string;
  hasActiveFilters?: boolean;
}

export function FilterPanel({ 
  isOpen, 
  onClose, 
  onClearFilters, 
  children, 
  className,
  hasActiveFilters = false
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "mb-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 p-4 shadow-sm animate-in slide-in-from-top-2",
      className
    )}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Advanced Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && onClearFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
              Clear All
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
