import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { LoadingSpinner } from './LoadingState';

export interface Option {
  label: string;
  value: string;
  description?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  error?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Select an option...',
  disabled = false,
  isLoading = false,
  error = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cachedLabel, setCachedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (selectedOption) {
      setCachedLabel(selectedOption.label);
    }
  }, [selectedOption]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query to selected option label if closed without selecting
        if (value && (selectedOption || cachedLabel)) {
          setInternalQuery(selectedOption?.label || cachedLabel);
        } else {
          setInternalQuery('');
          setSearchQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, value, cachedLabel]);

  useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, onSearch]);

  // Sync internalQuery when selectedOption changes externally
  useEffect(() => {
    if (selectedOption && !isOpen) {
      setInternalQuery(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  // If onSearch is not provided, filter locally
  const displayOptions = onSearch
    ? options
    : options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={internalQuery}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setIsOpen(true);
            setInternalQuery(e.target.value);
            setSearchQuery(e.target.value);
            if (value) onChange(''); // Clear selection when typing
          }}
          className={`w-full pr-10 pl-3.5 py-2.5 text-sm border rounded-xl bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
            error ? 'border-red-500' : 'border-slate-200'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {isLoading && <LoadingSpinner size="sm" />}
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {displayOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500 text-center">
                {isLoading ? 'Searching...' : 'No results found'}
              </li>
            ) : (
              displayOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                    option.value === value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setInternalQuery(option.label);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-slate-500 font-normal">
                        {option.description}
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
