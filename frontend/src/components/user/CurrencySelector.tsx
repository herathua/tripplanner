import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { useCurrency } from '../../contexts/CurrencyContext';
import { currencyApiService } from '../../services/currencyApiService';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

interface CurrencySelectorProps {
  onCurrencyChange?: (currencyCode: string) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  onCurrencyChange, 
  className = '' 
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { 
    currentCurrency, 
    currencyInfo, 
    supportedCurrencies, 
    setCurrency, 
    isLoading, 
    error 
  } = useCurrency();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCurrencyChange = async (newCurrencyCode: string) => {
    if (!user?.uid) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please log in to change currency preference',
        duration: 3000,
      }));
      return;
    }

    if (newCurrencyCode === currentCurrency) {
      return; // No change needed
    }

    setIsUpdating(true);
    setLocalError(null);

    try {
      console.log('Changing currency to:', newCurrencyCode);
      
      // Update backend first
      const response = await currencyApiService.updateUserCurrency(user.uid, {
        currencyCode: newCurrencyCode
      });

      if (response.success) {
        // Update local state
        setCurrency(newCurrencyCode);
        
        // Notify parent component
        if (onCurrencyChange) {
          onCurrencyChange(newCurrencyCode);
        }

        dispatch(addNotification({
          type: 'success',
          message: `Currency updated to ${response.currencyName} (${response.currencyCode})`,
          duration: 3000,
        }));

        console.log('Currency updated successfully:', response);
      } else {
        throw new Error(response.error || 'Failed to update currency');
      }

    } catch (error: any) {
      console.error('Error updating currency:', error);
      setLocalError(error.message || 'Failed to update currency');
      
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to update currency',
        duration: 5000,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700">
        Preferred Currency
      </label>
      
      <div className="relative">
        <select
          id="currency-select"
          value={currentCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          disabled={isUpdating || isLoading}
          className={`
            block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            sm:text-sm
            ${isUpdating || isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            ${displayError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
        
        {(isUpdating || isLoading) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {displayError}
        </p>
      )}

      {currencyInfo && !displayError && (
        <p className="text-sm text-gray-500">
          Current: {currencyInfo.symbol} {currencyInfo.name} ({currencyInfo.code})
        </p>
      )}

      <div className="text-xs text-gray-400">
        <p>Changing your currency preference will update how amounts are displayed throughout the application.</p>
        <p>Existing trip budgets and expenses will be converted to the new currency.</p>
      </div>
    </div>
  );
};

export default CurrencySelector;
