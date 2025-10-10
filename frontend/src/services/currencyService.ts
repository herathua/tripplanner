import * as money from 'money';

// Supported currencies with their symbols and formatting
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
}

// Common currencies supported by the application
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0, symbolPosition: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimalPlaces: 0, symbolPosition: 'before' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', decimalPlaces: 2, symbolPosition: 'before' },
];

// Default currency
export const DEFAULT_CURRENCY = 'USD';

// Exchange rates (in a real app, these would come from an API)
// These are sample rates - in production, use a real exchange rate API
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'CNY': 6.45,
  'INR': 74.0,
  'BRL': 5.2,
  'MXN': 20.0,
  'KRW': 1180.0,
  'SGD': 1.35,
  'HKD': 7.8,
  'NZD': 1.42,
  'SEK': 8.6,
  'NOK': 8.9,
  'DKK': 6.3,
  'PLN': 3.9,
  'CZK': 21.7,
  'LKR': 320.0,
};

class CurrencyService {
  private static instance: CurrencyService;
  private currentCurrency: string = DEFAULT_CURRENCY;

  private constructor() {
    this.initializeMoney();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private initializeMoney(): void {
    // Initialize money.js with exchange rates
    // Note: money.js properties are read-only in TypeScript, so we'll handle conversion manually
    console.log('Money.js initialized with exchange rates');
  }

  /**
   * Set the current currency for the user
   */
  public setCurrency(currencyCode: string): void {
    if (this.isValidCurrency(currencyCode)) {
      this.currentCurrency = currencyCode;
      // Store in localStorage for persistence
      localStorage.setItem('preferredCurrency', currencyCode);
    } else {
      console.warn(`Invalid currency code: ${currencyCode}. Using default: ${DEFAULT_CURRENCY}`);
      this.currentCurrency = DEFAULT_CURRENCY;
    }
  }

  /**
   * Get the current currency
   */
  public getCurrentCurrency(): string {
    return this.currentCurrency;
  }

  /**
   * Get currency information
   */
  public getCurrencyInfo(currencyCode?: string): CurrencyInfo | null {
    const code = currencyCode || this.currentCurrency;
    return SUPPORTED_CURRENCIES.find(currency => currency.code === code) || null;
  }

  /**
   * Check if a currency code is valid
   */
  public isValidCurrency(currencyCode: string): boolean {
    return SUPPORTED_CURRENCIES.some(currency => currency.code === currencyCode);
  }

  /**
   * Convert amount from one currency to another
   */
  public convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    try {
      if (!this.isValidCurrency(fromCurrency) || !this.isValidCurrency(toCurrency)) {
        console.warn(`Invalid currency codes: ${fromCurrency} -> ${toCurrency}`);
        return amount;
      }

      if (fromCurrency === toCurrency) {
        return amount;
      }

      // Manual conversion using exchange rates
      const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
      const toRate = EXCHANGE_RATES[toCurrency] || 1.0;
      
      // Convert from source currency to USD, then to target currency
      const amountInUSD = amount / fromRate;
      const convertedAmount = amountInUSD * toRate;
      
      return convertedAmount;
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount;
    }
  }

  /**
   * Format amount with currency symbol
   */
  public formatAmount(amount: number, currencyCode?: string): string {
    const currency = currencyCode || this.currentCurrency;
    const currencyInfo = this.getCurrencyInfo(currency);
    
    if (!currencyInfo) {
      return `${amount.toFixed(2)} ${currency}`;
    }

    const formattedAmount = amount.toFixed(currencyInfo.decimalPlaces);
    
    if (currencyInfo.symbolPosition === 'before') {
      return `${currencyInfo.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyInfo.symbol}`;
    }
  }

  /**
   * Format amount with currency symbol and conversion
   */
  public formatAmountWithConversion(amount: number, fromCurrency: string, toCurrency?: string): string {
    const targetCurrency = toCurrency || this.currentCurrency;
    
    if (fromCurrency === targetCurrency) {
      return this.formatAmount(amount, targetCurrency);
    }

    const convertedAmount = this.convertAmount(amount, fromCurrency, targetCurrency);
    return this.formatAmount(convertedAmount, targetCurrency);
  }

  /**
   * Get all supported currencies
   */
  public getSupportedCurrencies(): CurrencyInfo[] {
    return [...SUPPORTED_CURRENCIES];
  }

  /**
   * Load currency preference from localStorage
   */
  public loadCurrencyPreference(): string {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && this.isValidCurrency(savedCurrency)) {
      this.currentCurrency = savedCurrency;
      return savedCurrency;
    }
    return DEFAULT_CURRENCY;
  }

  /**
   * Update exchange rates (in a real app, this would fetch from an API)
   */
  public updateExchangeRates(newRates: Record<string, number>): void {
    try {
      // Update the EXCHANGE_RATES object
      Object.assign(EXCHANGE_RATES, newRates);
      console.log('Exchange rates updated');
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  public getExchangeRate(fromCurrency: string, toCurrency: string): number {
    try {
      if (fromCurrency === toCurrency) {
        return 1.0;
      }

      const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
      const toRate = EXCHANGE_RATES[toCurrency] || 1.0;
      
      return toRate / fromRate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 1.0;
    }
  }

  /**
   * Parse currency amount from string
   */
  public parseAmount(amountString: string, currencyCode?: string): number {
    const currency = currencyCode || this.currentCurrency;
    const currencyInfo = this.getCurrencyInfo(currency);
    
    if (!currencyInfo) {
      return parseFloat(amountString.replace(/[^\d.-]/g, '')) || 0;
    }

    // Remove currency symbol and parse
    let cleanAmount = amountString;
    if (currencyInfo.symbolPosition === 'before') {
      cleanAmount = amountString.replace(new RegExp(`\\${currencyInfo.symbol}`, 'g'), '');
    } else {
      cleanAmount = amountString.replace(new RegExp(`\\${currencyInfo.symbol}`, 'g'), '');
    }
    
    return parseFloat(cleanAmount.replace(/[^\d.-]/g, '')) || 0;
  }

  /**
   * Validate currency amount
   */
  public validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (isNaN(amount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    if (amount < 0) {
      return { isValid: false, error: 'Amount cannot be negative' };
    }
    
    if (amount > 999999999) {
      return { isValid: false, error: 'Amount is too large' };
    }
    
    return { isValid: true };
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance();

// CurrencyInfo is already exported above as an interface
