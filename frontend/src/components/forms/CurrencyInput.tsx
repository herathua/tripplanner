import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { currencyService } from '../../services/currencyService';

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  showCurrencySymbol?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  label,
  error,
  showCurrencySymbol = true,
}) => {
  const { currentCurrency, currencyInfo } = useCurrency();
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      if (numValue > 0) {
        const formatted = currencyService.formatAmount(numValue, currentCurrency);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    } else {
      setDisplayValue('');
    }
  }, [value, currentCurrency]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Parse the input value to get the numeric amount
    const numericValue = currencyService.parseAmount(inputValue, currentCurrency);
    
    // Validate the amount
    const validation = currencyService.validateAmount(numericValue);
    if (validation.isValid) {
      onChange(numericValue.toString());
    } else if (inputValue === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Format the value on blur
    if (value && !isNaN(Number(value))) {
      const formatted = currencyService.formatAmount(Number(value), currentCurrency);
      setDisplayValue(formatted);
    }
  };

  const handleFocus = () => {
    // Show raw number on focus for easier editing
    if (value && !isNaN(Number(value))) {
      setDisplayValue(value.toString());
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {showCurrencySymbol && currencyInfo && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">
              {currencyInfo.symbol}
            </span>
          </div>
        )}
        
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder || `Enter amount in ${currentCurrency}`}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            sm:text-sm
            ${showCurrencySymbol && currencyInfo ? 'pl-10' : 'pl-3'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-400 text-xs">
            {currentCurrency}
          </span>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Amount will be displayed in {currentCurrency}
      </p>
    </div>
  );
};

export default CurrencyInput;
