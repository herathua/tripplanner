import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencyService, CurrencyInfo } from '../services/currencyService';
import { useAppSelector } from '../store';

interface CurrencyContextType {
  currentCurrency: string;
  currencyInfo: CurrencyInfo | null;
  supportedCurrencies: CurrencyInfo[];
  setCurrency: (currencyCode: string) => void;
  formatAmount: (amount: number, fromCurrency?: string) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  isValidCurrency: (currencyCode: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAppSelector((state) => state.auth.user);

  // Load currency preference on mount
  useEffect(() => {
    const loadCurrencyPreference = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to load from localStorage
        const savedCurrency = currencyService.loadCurrencyPreference();
        
        // If user is logged in, we could fetch their preference from backend
        // For now, we'll use localStorage
        setCurrentCurrency(savedCurrency);
        setCurrencyInfo(currencyService.getCurrencyInfo(savedCurrency));
        
      } catch (err) {
        console.error('Error loading currency preference:', err);
        setError('Failed to load currency preference');
        // Fallback to default
        setCurrentCurrency('USD');
        setCurrencyInfo(currencyService.getCurrencyInfo('USD'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencyPreference();
  }, []);

  // Update currency info when currency changes
  useEffect(() => {
    const info = currencyService.getCurrencyInfo(currentCurrency);
    setCurrencyInfo(info);
  }, [currentCurrency]);

  const handleSetCurrency = (currencyCode: string) => {
    try {
      if (!currencyService.isValidCurrency(currencyCode)) {
        throw new Error(`Invalid currency code: ${currencyCode}`);
      }

      currencyService.setCurrency(currencyCode);
      setCurrentCurrency(currencyCode);
      setError(null);

      // In a real app, you would also update the backend
      // await updateUserCurrencyPreference(currencyCode);
      
    } catch (err) {
      console.error('Error setting currency:', err);
      setError(err instanceof Error ? err.message : 'Failed to set currency');
    }
  };

  const formatAmount = (amount: number, fromCurrency?: string): string => {
    try {
      if (fromCurrency && fromCurrency !== currentCurrency) {
        return currencyService.formatAmountWithConversion(amount, fromCurrency, currentCurrency);
      }
      return currencyService.formatAmount(amount, currentCurrency);
    } catch (err) {
      console.error('Error formatting amount:', err);
      return `${amount.toFixed(2)} ${currentCurrency}`;
    }
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    try {
      return currencyService.convertAmount(amount, fromCurrency, toCurrency || currentCurrency);
    } catch (err) {
      console.error('Error converting amount:', err);
      return amount;
    }
  };

  const isValidCurrency = (currencyCode: string): boolean => {
    return currencyService.isValidCurrency(currencyCode);
  };

  const contextValue: CurrencyContextType = {
    currentCurrency,
    currencyInfo,
    supportedCurrencies: currencyService.getSupportedCurrencies(),
    setCurrency: handleSetCurrency,
    formatAmount,
    convertAmount,
    isValidCurrency,
    isLoading,
    error,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Hook for formatting amounts with current currency
export const useFormatAmount = () => {
  const { formatAmount, currentCurrency } = useCurrency();
  
  return {
    formatAmount,
    currentCurrency,
  };
};

// Hook for currency conversion
export const useCurrencyConversion = () => {
  const { convertAmount, currentCurrency } = useCurrency();
  
  return {
    convertAmount,
    currentCurrency,
  };
};

export default CurrencyContext;
