import React from 'react';
import { useFormatAmount } from '../../contexts/CurrencyContext';

interface CurrencyDisplayProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
  showCurrencyCode?: boolean;
  precision?: number;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  fromCurrency,
  className = '',
  showCurrencyCode = false,
  precision
}) => {
  const { formatAmount, currentCurrency } = useFormatAmount();

  // Handle precision if specified
  const displayAmount = precision !== undefined ? 
    Number(amount.toFixed(precision)) : 
    amount;

  const formattedAmount = formatAmount(displayAmount, fromCurrency);

  return (
    <span className={className}>
      {formattedAmount}
      {showCurrencyCode && (
        <span className="text-xs text-gray-500 ml-1">
          {fromCurrency || currentCurrency}
        </span>
      )}
    </span>
  );
};

export default CurrencyDisplay;
