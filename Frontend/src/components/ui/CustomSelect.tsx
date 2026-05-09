import { useState, useRef, useEffect, forwardRef, memo, useLayoutEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  className?: string;
  name?: string;
}

const CustomSelectComponent = forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ value, onChange, options, className, name }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    useLayoutEffect(() => {
      if (isOpen && selectedItemRef.current) {
        selectedItemRef.current.scrollIntoView({ block: 'nearest' });
      }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      if (onChange) {
        onChange(optionValue);
      }
    };

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
      <div ref={containerRef} className="relative">
        <input type="hidden" name={name} value={selectedValue} />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2 pr-10 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer',
            className
          )}
        >
          <span>{selectedOption?.label || 'Selecione...'}</span>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-lg max-h-72 overflow-y-auto overscroll-contain">
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  ref={isSelected ? selectedItemRef : undefined}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors',
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white font-medium'
                      : 'hover:bg-purple-50 text-foreground'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

CustomSelectComponent.displayName = 'CustomSelect';

export const CustomSelect = memo(CustomSelectComponent);
