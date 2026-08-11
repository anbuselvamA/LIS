import * as React from 'react';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: boolean | string;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export function StatusBadge({ status, activeLabel = 'Active', inactiveLabel = 'Inactive', className }: StatusBadgeProps) {
  const isActive = typeof status === 'boolean' ? status : status.toLowerCase() === 'active';
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium transition-colors',
        isActive 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-red-50 text-red-700 border-red-200',
        className
      )}
    >
      <div className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", isActive ? "bg-green-500" : "bg-red-500")} />
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
}
