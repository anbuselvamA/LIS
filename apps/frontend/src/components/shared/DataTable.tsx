import * as React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../ui/table';
import { Pagination } from '../ui/pagination';
import { TableSkeleton } from '../ui/skeleton-loader';
import { EmptyState } from '../ui/empty-state';
import { Button } from '../ui/button';
import { RefreshCw, Download, Printer, Settings2, FileQuestion } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  visible?: boolean;
}

export interface DataTableProps<T> {
  data: T[] | undefined | null;
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  isError?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  
  // Pagination
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  
  // Utilities
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  isError,
  emptyIcon = FileQuestion,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onRefresh,
  onExport,
  onPrint,
  className,
  onRowClick
}: DataTableProps<T>) {
  // Normalize safeData
  const safeData = Array.isArray(data) ? data : [];

  // Column Visibility State
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
  );
  const [showVisibilityMenu, setShowVisibilityMenu] = React.useState(false);

  const toggleColumn = (key: string) => {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleColumns = columns.filter(col => columnVisibility[col.key]);

  // Handle Export CSV Client-side (if onExport is not provided)
  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    // Default client-side export
    if (!safeData.length) return;
    const headers = visibleColumns.map(c => c.header).join(',');
    // Only works reliably if cell content is string/number, but this is a generic fallback
    const rows = safeData.map(row => 
      visibleColumns.map(c => {
        const cellData = c.cell(row);
        return typeof cellData === 'string' || typeof cellData === 'number' ? `"${cellData}"` : '""';
      }).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-md border bg-white">
        <p className="text-red-500 mb-4 font-medium">Unable to connect to the laboratory server.</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className={cn("flex w-full flex-col space-y-4", className)}>
      
      {/* Utilities Toolbar */}
      <div className="flex items-center justify-end space-x-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} title="Refresh">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleExport} title="Export CSV">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} title="Print">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        
        {/* Column Visibility Toggle */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            title="Toggle Columns"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Columns
          </Button>
          
          {showVisibilityMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-white p-2 shadow-md">
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">Toggle Columns</div>
              {columns.map(col => (
                <label key={col.key} className="flex cursor-pointer items-center space-x-2 rounded px-2 py-1.5 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={columnVisibility[col.key]}
                    onChange={() => toggleColumn(col.key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{col.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white">
        {safeData.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            className="py-12"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead key={col.key}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeData.map((row) => (
                <TableRow 
                  key={row.id} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalCount > 0 && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
