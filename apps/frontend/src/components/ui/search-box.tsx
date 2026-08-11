import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';

interface SearchBoxProps {
  placeholder?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchBox({ placeholder = 'Search...', onChange, debounceMs = 300, className }: SearchBoxProps) {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onChange]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-9 pr-9"
      />
      {value && (
        <button 
          onClick={() => setValue('')}
          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
