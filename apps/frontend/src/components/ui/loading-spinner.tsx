import * as React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function LoadingSpinner({ size = 24, className, ...props }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 size={size} className="animate-spin text-blue-600" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-gray-50/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
        <LoadingSpinner size={40} />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading data...</p>
      </div>
    </div>
  );
}
