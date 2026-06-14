// src/components/Dropdown.tsx
import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import Input from './Input';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

interface DropdownProps {
  options?: DropdownOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  variant?: 'default' | 'filled' | 'outline' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  searchEndpoint?: string;
  searchDebounce?: number;
  onSearch?: (query: string) => Promise<DropdownOption[]> | DropdownOption[];
  renderOption?: (option: DropdownOption) => ReactNode;
  renderSelected?: (option: DropdownOption) => ReactNode;
  maxHeight?: string;
  noResultsMessage?: string;
  loadingMessage?: string;
  clearable?: boolean;
  className?: string;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = 'Select...',
      label,
      error,
      helperText,
      icon,
      variant = 'default',
      size = 'md',
      fullWidth = true,
      disabled = false,
      required = false,
      multiple = false,
      searchable = false,
      searchEndpoint,
      searchDebounce = 300,
      onSearch,
      renderOption,
      renderSelected,
      maxHeight = 'max-h-60',
      noResultsMessage = 'No results found',
      loadingMessage = 'Loading...',
      clearable = false,
      className = '',
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] =
      useState<DropdownOption[]>(options);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
      [],
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // Variant classes
    const getVariantClasses = () => {
      switch (variant) {
        case 'default':
          return 'border border-outline-variant bg-surface-container-low rounded-md';
        case 'filled':
          return 'border-0 bg-surface-container rounded-md';
        case 'outline':
          return 'border-2 border-outline-variant bg-transparent rounded-md';
        case 'flushed':
          return 'border-b-2 border-outline-variant bg-transparent rounded-none px-0';
        default:
          return 'border border-outline-variant bg-surface-container-low rounded-md';
      }
    };

    // State classes
    const getStateClasses = () => {
      if (error) {
        return 'border-error focus:border-error focus:ring-error';
      }
      return 'focus:border-primary focus:ring-2 focus:ring-primary';
    };

    // Initialize selected options
    useEffect(() => {
      if (value !== undefined) {
        const values = Array.isArray(value) ? value : [value];
        const selected = options.filter((opt) => values.includes(opt.value));
        setSelectedOptions(selected);
      }
    }, [value, options]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search
    useEffect(() => {
      if (!searchable) {
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredOptions(filtered);
        return;
      }

      // Debounce search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (searchEndpoint || onSearch) {
        debounceTimerRef.current = setTimeout(async () => {
          setIsLoading(true);
          try {
            let results: DropdownOption[] = [];

            if (onSearch) {
              results = await onSearch(searchQuery);
            } else if (searchEndpoint) {
              const response = await fetch(
                `${searchEndpoint}?q=${encodeURIComponent(searchQuery)}`,
              );
              results = await response.json();
            }

            setFilteredOptions(results);
          } catch (error) {
            console.error('Search failed:', error);
            setFilteredOptions([]);
          } finally {
            setIsLoading(false);
          }
        }, searchDebounce);
      } else {
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredOptions(filtered);
      }

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [
      searchQuery,
      options,
      searchable,
      searchEndpoint,
      onSearch,
      searchDebounce,
    ]);

    const handleSelect = (option: DropdownOption) => {
      if (option.disabled) return;

      if (multiple) {
        const isSelected = selectedOptions.some(
          (opt) => opt.value === option.value,
        );
        let newSelected: DropdownOption[];

        if (isSelected) {
          newSelected = selectedOptions.filter(
            (opt) => opt.value !== option.value,
          );
        } else {
          newSelected = [...selectedOptions, option];
        }

        setSelectedOptions(newSelected);
        onChange?.(newSelected.map((opt) => opt.value));
      } else {
        setSelectedOptions([option]);
        onChange?.(option.value);
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedOptions([]);
      onChange?.(multiple ? [] : '');
    };

    const removeSelected = (
      optionToRemove: DropdownOption,
      e: React.MouseEvent,
    ) => {
      e.stopPropagation();
      const newSelected = selectedOptions.filter(
        (opt) => opt.value !== optionToRemove.value,
      );
      setSelectedOptions(newSelected);
      onChange?.(newSelected.map((opt) => opt.value));
    };

    const defaultRenderOption = (option: DropdownOption) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {option.icon && <span className="shrink-0">{option.icon}</span>}
          <span className="font-medium">{option.label}</span>
        </div>
        {option.description && (
          <span className="text-sm ml-6 text-on-surface-variant">
            {option.description}
          </span>
        )}
      </div>
    );

    const defaultRenderSelected = (option: DropdownOption) => (
      <div className="flex items-center gap-2">
        {option.icon && <span className="shrink-0">{option.icon}</span>}
        <span>{option.label}</span>
      </div>
    );

    // Group options by group property
    const groupedOptions = filteredOptions.reduce(
      (groups, option) => {
        const group = option.group || '';
        if (!groups[group]) groups[group] = [];
        groups[group].push(option);
        return groups;
      },
      {} as Record<string, DropdownOption[]>,
    );

    return (
      <div ref={ref} className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-on-surface mb-1">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div ref={dropdownRef} className="relative">
          {/* Dropdown trigger */}
          <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`
              relative w-full cursor-pointer transition-all duration-200
              ${sizeClasses[size]}
              ${getVariantClasses()}
              ${getStateClasses()}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-container' : ''}
              ${isOpen ? 'ring-2 ring-primary' : ''}
              text-on-surface
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex overflow-scroll scrollbar-none max-w-full gap-1 flex-1">
                {selectedOptions.length > 0 ? (
                  multiple ? (
                    selectedOptions.map((option) => (
                      <span
                        key={option.value}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-secondary-container text-on-secondary-container rounded-md"
                      >
                        {renderSelected
                          ? renderSelected(option)
                          : defaultRenderSelected(option)}
                        <button
                          onClick={(e) => removeSelected(option, e)}
                          className="hover:text-error transition-colors"
                          aria-label={`Remove ${option.label}`}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="truncate">
                      {renderSelected
                        ? renderSelected(selectedOptions[0])
                        : defaultRenderSelected(selectedOptions[0])}
                    </span>
                  )
                ) : (
                  <span className="text-on-surface-variant">
                    {placeholder}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {clearable && selectedOptions.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1 hover:text-on-surface transition-colors"
                    aria-label="Clear selection"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <svg
                  className={`h-5 w-5 transition-transform duration-200 text-on-surface-variant ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Dropdown menu */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-surface-container border border-outline-variant rounded-md shadow-elevation-2 overflow-hidden">
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b border-outline-variant">
                  <div className="relative">
                    <Input
                      ref={searchInputRef}
                      variant="flushed"
                      clearable
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3 py-1 text-sm"
                      autoFocus
                    />
                    {icon && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {icon}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Options list */}
              <div className={`overflow-y-auto scrollbar-none ${maxHeight}`}>
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-on-surface-variant">
                    {loadingMessage}
                  </div>
                ) : Object.keys(groupedOptions).length === 0 ? (
                  <div className="px-4 py-3 text-center text-on-surface-variant">
                    {noResultsMessage}
                  </div>
                ) : (
                  Object.entries(groupedOptions).map(
                    ([group, groupOptions]) => (
                      <div key={group}>
                        {group && (
                          <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant bg-surface-container-high">
                            {group}
                          </div>
                        )}
                        {groupOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`
                            px-3 py-1 cursor-pointer transition-colors
                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-highest'}
                            ${selectedOptions.some((opt) => opt.value === option.value) ? 'bg-primary-container text-on-primary-container' : 'text-on-surface'}
                          `}
                          >
                            {renderOption
                              ? renderOption(option)
                              : defaultRenderOption(option)}
                          </div>
                        ))}
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-on-surface-variant">{helperText}</p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;