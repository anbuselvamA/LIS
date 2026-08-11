import * as React from 'react';
import { Filter, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { SearchBox } from '../ui/search-box';

interface ToolbarProps {
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  
  hasFilters?: boolean;
  onToggleFilters?: () => void;
  isFiltersOpen?: boolean;
  
  onAdd?: () => void;
  addLabel?: string;
}

export function Toolbar({
  onSearch,
  searchPlaceholder = 'Search...',
  hasFilters = false,
  onToggleFilters,
  isFiltersOpen = false,
  onAdd,
  addLabel = 'Add New'
}: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex flex-1 items-center space-x-2 sm:max-w-md">
        <SearchBox 
          onChange={onSearch} 
          placeholder={searchPlaceholder} 
          className="w-full"
        />
        
        {hasFilters && (
          <Button 
            variant={isFiltersOpen ? 'default' : 'outline'} 
            size="icon" 
            onClick={onToggleFilters}
            className="shrink-0"
            title="Toggle Filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {onAdd && (
        <Button onClick={onAdd} className="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4 shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
