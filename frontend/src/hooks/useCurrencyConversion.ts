import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencyApiService } from '../services/currencyApiService';

interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  isLoading: boolean;
  error: string | null;
}

export const useCurrencyConversion = (
  amount: number,
  fromCurrency: string,
  toCurrency?: string
) => {
  const { currentCurrency, convertAmount } = useCurrency();
  const [result, setResult] = useState<ConversionResult>({
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: amount,
    targetCurrency: toCurrency || currentCurrency,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const performConversion = async () => {
      if (amount <= 0 || !fromCurrency) {
        setResult(prev => ({
          ...prev,
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          targetCurrency: toCurrency || currentCurrency,
          isLoading: false,
          error: null,
        }));
        return;
      }

      const targetCurr = toCurrency || currentCurrency;
      
      if (fromCurrency === targetCurr) {
        setResult(prev => ({
          ...prev,
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          targetCurrency: targetCurr,
          isLoading: false,
          error: null,
        }));
        return;
      }

      setResult(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Try local conversion first (faster)
        const localConverted = convertAmount(amount, fromCurrency, targetCurr);
        
        setResult({
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: localConverted,
          targetCurrency: targetCurr,
          isLoading: false,
          error: null,
        });

        // Optionally verify with API conversion (for accuracy)
        // const apiResult = await currencyApiService.convertCurrency(amount, fromCurrency, targetCurr);
        // if (apiResult.success) {
        //   setResult({
        //     originalAmount: amount,
        //     originalCurrency: fromCurrency,
        //     convertedAmount: apiResult.convertedAmount,
        //     targetCurrency: targetCurr,
        //     isLoading: false,
        //     error: null,
        //   });
        // }

      } catch (error: any) {
        console.error('Currency conversion error:', error);
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Conversion failed',
        }));
      }
    };

    performConversion();
  }, [amount, fromCurrency, toCurrency, currentCurrency, convertAmount]);

  return result;
};

export default useCurrencyConversion;
