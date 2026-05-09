import { forwardRef, type InputHTMLAttributes, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
}

const CurrencyInputComponent = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (value !== undefined && value !== null && !isFocused) {
        setDisplayValue(formatToBRL(value));
      }
    }, [value, isFocused]);

    const formatToBRL = (num: number): string => {
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const parseFromBRL = (str: string): number => {
      if (!str) return 0;
      const cleaned = str.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      let cleaned = input.replace(/[^\d,]/g, '');
      
      const parts = cleaned.split(',');
      if (parts.length > 2) return;
      
      if (parts[1] && parts[1].length > 2) return;

      setDisplayValue(cleaned);
      
      const numericValue = parseFromBRL(cleaned);
      if (onChange) {
        onChange(numericValue);
      }
    }, [onChange]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      const numericValue = parseFromBRL(displayValue);
      if (numericValue > 0) {
        setDisplayValue(formatToBRL(numericValue));
      } else {
        setDisplayValue('');
      }
    }, [displayValue]);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="0,00"
        className={cn(
          'flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
CurrencyInputComponent.displayName = 'CurrencyInput';

export const CurrencyInput = memo(CurrencyInputComponent);
