import { apiClient as api } from '../config/api';

export interface CurrencyUpdateRequest {
  currencyCode: string;
  convertExistingAmounts?: number;
}

export interface CurrencyResponse {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  success: boolean;
  message?: string;
  error?: string;
}

export interface CurrencyConversionResponse {
  success: boolean;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  error?: string;
}

export interface SupportedCurrenciesResponse {
  [currencyCode: string]: {
    name: string;
    symbol: string;
  };
}

class CurrencyApiService {
  private baseUrl = '/currency';

  /**
   * Update user's preferred currency
   */
  async updateUserCurrency(firebaseUid: string, request: CurrencyUpdateRequest): Promise<CurrencyResponse> {
    try {
      console.log('Updating user currency:', { firebaseUid, request });
      
      const response = await api.put(`${this.baseUrl}/user/${firebaseUid}`, request);
      
      console.log('Currency update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user currency:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to update currency',
        currencyCode: '',
        currencyName: '',
        currencySymbol: ''
      };
    }
  }

  /**
   * Get user's current currency preference
   */
  async getUserCurrency(firebaseUid: string): Promise<CurrencyResponse> {
    try {
      console.log('Getting user currency:', firebaseUid);
      
      const response = await api.get(`${this.baseUrl}/user/${firebaseUid}`);
      
      console.log('Get currency response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting user currency:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: error.message || 'Failed to get currency',
        currencyCode: 'USD',
        currencyName: 'US Dollar',
        currencySymbol: '$'
      };
    }
  }

  /**
   * Get all supported currencies
   */
  async getSupportedCurrencies(): Promise<SupportedCurrenciesResponse> {
    try {
      console.log('Getting supported currencies');
      
      const response = await api.get(`${this.baseUrl}/supported`);
      
      console.log('Supported currencies response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting supported currencies:', error);
      
      // Return fallback currencies
      return {
        'USD': { name: 'US Dollar', symbol: '$' },
        'EUR': { name: 'Euro', symbol: '€' },
        'GBP': { name: 'British Pound', symbol: '£' },
        'JPY': { name: 'Japanese Yen', symbol: '¥' },
        'CAD': { name: 'Canadian Dollar', symbol: 'C$' },
        'AUD': { name: 'Australian Dollar', symbol: 'A$' }
      };
    }
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<CurrencyConversionResponse> {
    try {
      console.log('Converting currency:', { amount, fromCurrency, toCurrency });
      
      const response = await api.post(`${this.baseUrl}/convert`, null, {
        params: {
          amount,
          fromCurrency,
          toCurrency
        }
      });
      
      console.log('Currency conversion response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error converting currency:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        error: error.message || 'Failed to convert currency'
      };
    }
  }

  /**
   * Validate currency code
   */
  async validateCurrency(currencyCode: string): Promise<boolean> {
    try {
      const supportedCurrencies = await this.getSupportedCurrencies();
      return currencyCode in supportedCurrencies;
    } catch (error) {
      console.error('Error validating currency:', error);
      return false;
    }
  }
}

// Export singleton instance
export const currencyApiService = new CurrencyApiService();
export default currencyApiService;
