import * as React from 'react';

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
      ${status === 'COLLECTED' ? 'bg-blue-100 text-blue-800' : ''}
      ${status === 'RECEIVED' ? 'bg-purple-100 text-purple-800' : ''}
      ${status === 'PROCESSING' || status === 'ENTERED' ? 'bg-indigo-100 text-indigo-800' : ''}
      ${status === 'COMPLETED' || status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : ''}
      ${status === 'CANCELLED' || status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
    `}>
      {status}
    </span>
  );
};
