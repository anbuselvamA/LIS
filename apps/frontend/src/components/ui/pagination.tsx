import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Simple pagination logic for displaying pages (max 5 pages visible around current)
  const renderPages = () => {
    if (totalPages <= 7) {
      return pages.map((p) => (
        <Button
          key={p}
          variant={p === currentPage ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ));
    }

    const visiblePages = [];
    if (currentPage <= 4) {
      visiblePages.push(...pages.slice(0, 5), '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      visiblePages.push(1, '...', ...pages.slice(totalPages - 5));
    } else {
      visiblePages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return visiblePages.map((p, i) => {
      if (p === '...') {
        return (
          <div key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-gray-500">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        );
      }
      return (
        <Button
          key={p}
          variant={p === currentPage ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(p as number)}
        >
          {p}
        </Button>
      );
    });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous Page</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {renderPages()}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next Page</span>
      </Button>
    </div>
  );
}
