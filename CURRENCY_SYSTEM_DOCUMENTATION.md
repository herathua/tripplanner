# Currency Management System Documentation

## Overview

This document describes the comprehensive currency management system implemented for the TripPlanner application. The system allows users to select their preferred currency and automatically updates all monetary displays throughout the application.

## Features

- ✅ User currency preference selection
- ✅ Automatic currency conversion and formatting
- ✅ Persistent currency settings (database + localStorage)
- ✅ Real-time updates across the application
- ✅ Support for 21+ major currencies
- ✅ Error handling and fallbacks
- ✅ Modular and reusable components

## Architecture

### Backend Components

#### 1. User Model Extension
- **File**: `backend/src/main/java/com/example/tripplanner/model/User.java`
- **Addition**: `preferredCurrency` field with default value "USD"
- **Database**: New column `preferred_currency` (VARCHAR(3))

#### 2. Currency Service
- **File**: `backend/src/main/java/com/example/tripplanner/service/CurrencyService.java`
- **Features**:
  - User currency preference management
  - Currency validation
  - Exchange rate conversion (sample rates)
  - Support for 20+ currencies

#### 3. Currency Controller
- **File**: `backend/src/main/java/com/example/tripplanner/controller/CurrencyController.java`
- **Endpoints**:
  - `PUT /api/currency/user/{firebaseUid}` - Update user currency
  - `GET /api/currency/user/{firebaseUid}` - Get user currency
  - `GET /api/currency/supported` - Get supported currencies
  - `POST /api/currency/convert` - Convert between currencies

#### 4. DTOs
- **CurrencyUpdateRequest**: Request payload for currency updates
- **CurrencyResponse**: Standardized response format

### Frontend Components

#### 1. Currency Service
- **File**: `frontend/src/services/currencyService.ts`
- **Features**:
  - Money.js integration for conversions
  - Currency formatting and validation
  - Local storage persistence
  - Singleton pattern for global state

#### 2. Currency Context
- **File**: `frontend/src/contexts/CurrencyContext.tsx`
- **Features**:
  - React context for currency state
  - Global currency management
  - Real-time updates across components
  - Error handling and loading states

#### 3. Currency API Service
- **File**: `frontend/src/services/currencyApiService.ts`
- **Features**:
  - Backend API communication
  - Error handling and fallbacks
  - Type-safe API calls

#### 4. UI Components
- **CurrencySelector**: Dropdown for currency selection
- **CurrencyDisplay**: Reusable currency formatting component
- **CurrencyInput**: Currency-aware input field

## Supported Currencies

The system supports 21 major currencies:

| Code | Symbol | Name | Decimal Places |
|------|--------|------|----------------|
| USD | $ | US Dollar | 2 |
| EUR | € | Euro | 2 |
| GBP | £ | British Pound | 2 |
| JPY | ¥ | Japanese Yen | 0 |
| CAD | C$ | Canadian Dollar | 2 |
| AUD | A$ | Australian Dollar | 2 |
| CHF | CHF | Swiss Franc | 2 |
| CNY | ¥ | Chinese Yuan | 2 |
| INR | ₹ | Indian Rupee | 2 |
| BRL | R$ | Brazilian Real | 2 |
| MXN | $ | Mexican Peso | 2 |
| KRW | ₩ | South Korean Won | 0 |
| SGD | S$ | Singapore Dollar | 2 |
| HKD | HK$ | Hong Kong Dollar | 2 |
| NZD | NZ$ | New Zealand Dollar | 2 |
| SEK | kr | Swedish Krona | 2 |
| NOK | kr | Norwegian Krone | 2 |
| DKK | kr | Danish Krone | 2 |
| PLN | zł | Polish Zloty | 2 |
| CZK | Kč | Czech Koruna | 2 |
| LKR | Rs | Sri Lankan Rupee | 2 |

## Usage Examples

### 1. Using Currency Context

```tsx
import { useCurrency, useFormatAmount } from '../contexts/CurrencyContext';

function MyComponent() {
  const { currentCurrency, setCurrency, formatAmount } = useCurrency();
  
  return (
    <div>
      <p>Current currency: {currentCurrency}</p>
      <p>Formatted amount: {formatAmount(100)}</p>
      <button onClick={() => setCurrency('EUR')}>
        Switch to Euro
      </button>
    </div>
  );
}
```

### 2. Using Currency Display Component

```tsx
import CurrencyDisplay from '../components/common/CurrencyDisplay';

function TripCard({ trip }) {
  return (
    <div>
      <h3>{trip.title}</h3>
      <CurrencyDisplay 
        amount={trip.budget} 
        fromCurrency={trip.currency || 'USD'}
        className="text-green-600 font-bold"
      />
    </div>
  );
}
```

### 3. Using Currency Input

```tsx
import CurrencyInput from '../components/forms/CurrencyInput';

function BudgetForm() {
  const [budget, setBudget] = useState('');
  
  return (
    <CurrencyInput
      value={budget}
      onChange={setBudget}
      label="Trip Budget"
      required
      placeholder="Enter your budget"
    />
  );
}
```

### 4. Backend API Usage

```javascript
// Update user currency
const response = await fetch('/api/currency/user/user123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ currencyCode: 'EUR' })
});

// Convert currency
const conversion = await fetch('/api/currency/convert?amount=100&fromCurrency=USD&toCurrency=EUR');
```

## Implementation Details

### Database Migration

The system adds a new column to the users table:

```sql
ALTER TABLE users ADD COLUMN preferred_currency VARCHAR(3) DEFAULT 'USD';
```

### Exchange Rates

Currently uses sample exchange rates. In production, integrate with a real-time exchange rate API:

```javascript
// Example integration with exchange rate API
const updateExchangeRates = async () => {
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  const data = await response.json();
  currencyService.updateExchangeRates(data.rates);
};
```

### Error Handling

The system includes comprehensive error handling:

- Invalid currency codes fallback to USD
- Network errors show user-friendly messages
- Conversion errors return original amount
- Validation errors prevent invalid inputs

### Performance Considerations

- Currency conversions are cached locally
- Exchange rates are updated periodically
- Local storage reduces API calls
- Singleton pattern prevents multiple instances

## Testing

### Unit Tests

```javascript
// Example test for currency service
describe('CurrencyService', () => {
  it('should format USD amounts correctly', () => {
    const formatted = currencyService.formatAmount(100, 'USD');
    expect(formatted).toBe('$100.00');
  });
  
  it('should convert between currencies', () => {
    const converted = currencyService.convertAmount(100, 'USD', 'EUR');
    expect(converted).toBeCloseTo(85, 1);
  });
});
```

### Integration Tests

```javascript
// Example test for currency API
describe('Currency API', () => {
  it('should update user currency', async () => {
    const response = await currencyApiService.updateUserCurrency('user123', {
      currencyCode: 'EUR'
    });
    expect(response.success).toBe(true);
    expect(response.currencyCode).toBe('EUR');
  });
});
```

## Deployment Considerations

### Environment Variables

```bash
# Exchange rate API key
EXCHANGE_RATE_API_KEY=your_api_key_here

# Currency update frequency (in minutes)
CURRENCY_UPDATE_FREQUENCY=60
```

### Production Optimizations

1. **Exchange Rate Updates**: Implement scheduled job to update rates
2. **Caching**: Use Redis for exchange rate caching
3. **Monitoring**: Add metrics for conversion accuracy
4. **Fallbacks**: Implement multiple exchange rate providers

## Troubleshooting

### Common Issues

1. **Currency not updating**: Check localStorage and database sync
2. **Conversion errors**: Verify exchange rates are loaded
3. **Formatting issues**: Check currency symbol positioning
4. **API errors**: Verify backend endpoints are accessible

### Debug Mode

Enable debug logging:

```javascript
// In currencyService.ts
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Currency conversion:', details);
```

## Future Enhancements

1. **Real-time Exchange Rates**: Integrate with live exchange rate APIs
2. **Historical Rates**: Store and use historical exchange rates
3. **Currency Trends**: Show currency value trends over time
4. **Multi-currency Support**: Allow multiple currencies per trip
5. **Offline Support**: Cache rates for offline usage
6. **Currency Alerts**: Notify users of significant rate changes

## Contributing

When adding new currencies:

1. Add to `SUPPORTED_CURRENCIES` array
2. Update backend `CurrencyService`
3. Add exchange rate
4. Test formatting and conversion
5. Update documentation

## License

This currency management system is part of the TripPlanner application and follows the same licensing terms.
