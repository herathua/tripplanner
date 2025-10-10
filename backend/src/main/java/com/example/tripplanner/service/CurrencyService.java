package com.example.tripplanner.service;

import com.example.tripplanner.dto.CurrencyResponse;
import com.example.tripplanner.dto.CurrencyUpdateRequest;
import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class CurrencyService {

    @Autowired
    private UserRepository userRepository;

    // Supported currencies with their information
    private static final Map<String, Map<String, String>> SUPPORTED_CURRENCIES = new HashMap<>();
    
    static {
        // Initialize supported currencies
        Map<String, String> usd = new HashMap<>();
        usd.put("name", "US Dollar");
        usd.put("symbol", "$");
        SUPPORTED_CURRENCIES.put("USD", usd);
        
        Map<String, String> eur = new HashMap<>();
        eur.put("name", "Euro");
        eur.put("symbol", "€");
        SUPPORTED_CURRENCIES.put("EUR", eur);
        
        Map<String, String> gbp = new HashMap<>();
        gbp.put("name", "British Pound");
        gbp.put("symbol", "£");
        SUPPORTED_CURRENCIES.put("GBP", gbp);
        
        Map<String, String> jpy = new HashMap<>();
        jpy.put("name", "Japanese Yen");
        jpy.put("symbol", "¥");
        SUPPORTED_CURRENCIES.put("JPY", jpy);
        
        Map<String, String> cad = new HashMap<>();
        cad.put("name", "Canadian Dollar");
        cad.put("symbol", "C$");
        SUPPORTED_CURRENCIES.put("CAD", cad);
        
        Map<String, String> aud = new HashMap<>();
        aud.put("name", "Australian Dollar");
        aud.put("symbol", "A$");
        SUPPORTED_CURRENCIES.put("AUD", aud);
        
        Map<String, String> chf = new HashMap<>();
        chf.put("name", "Swiss Franc");
        chf.put("symbol", "CHF");
        SUPPORTED_CURRENCIES.put("CHF", chf);
        
        Map<String, String> cny = new HashMap<>();
        cny.put("name", "Chinese Yuan");
        cny.put("symbol", "¥");
        SUPPORTED_CURRENCIES.put("CNY", cny);
        
        Map<String, String> inr = new HashMap<>();
        inr.put("name", "Indian Rupee");
        inr.put("symbol", "₹");
        SUPPORTED_CURRENCIES.put("INR", inr);
        
        Map<String, String> brl = new HashMap<>();
        brl.put("name", "Brazilian Real");
        brl.put("symbol", "R$");
        SUPPORTED_CURRENCIES.put("BRL", brl);
        
        Map<String, String> mxn = new HashMap<>();
        mxn.put("name", "Mexican Peso");
        mxn.put("symbol", "$");
        SUPPORTED_CURRENCIES.put("MXN", mxn);
        
        Map<String, String> krw = new HashMap<>();
        krw.put("name", "South Korean Won");
        krw.put("symbol", "₩");
        SUPPORTED_CURRENCIES.put("KRW", krw);
        
        Map<String, String> sgd = new HashMap<>();
        sgd.put("name", "Singapore Dollar");
        sgd.put("symbol", "S$");
        SUPPORTED_CURRENCIES.put("SGD", sgd);
        
        Map<String, String> hkd = new HashMap<>();
        hkd.put("name", "Hong Kong Dollar");
        hkd.put("symbol", "HK$");
        SUPPORTED_CURRENCIES.put("HKD", hkd);
        
        Map<String, String> nzd = new HashMap<>();
        nzd.put("name", "New Zealand Dollar");
        nzd.put("symbol", "NZ$");
        SUPPORTED_CURRENCIES.put("NZD", nzd);
        
        Map<String, String> sek = new HashMap<>();
        sek.put("name", "Swedish Krona");
        sek.put("symbol", "kr");
        SUPPORTED_CURRENCIES.put("SEK", sek);
        
        Map<String, String> nok = new HashMap<>();
        nok.put("name", "Norwegian Krone");
        nok.put("symbol", "kr");
        SUPPORTED_CURRENCIES.put("NOK", nok);
        
        Map<String, String> dkk = new HashMap<>();
        dkk.put("name", "Danish Krone");
        dkk.put("symbol", "kr");
        SUPPORTED_CURRENCIES.put("DKK", dkk);
        
        Map<String, String> pln = new HashMap<>();
        pln.put("name", "Polish Zloty");
        pln.put("symbol", "zł");
        SUPPORTED_CURRENCIES.put("PLN", pln);
        
        Map<String, String> czk = new HashMap<>();
        czk.put("name", "Czech Koruna");
        czk.put("symbol", "Kč");
        SUPPORTED_CURRENCIES.put("CZK", czk);
        
        Map<String, String> lkr = new HashMap<>();
        lkr.put("name", "Sri Lankan Rupee");
        lkr.put("symbol", "Rs");
        SUPPORTED_CURRENCIES.put("LKR", lkr);
    }

    /**
     * Update user's preferred currency
     */
    public CurrencyResponse updateUserCurrency(String firebaseUid, CurrencyUpdateRequest request) {
        try {
            System.out.println("=== UPDATING USER CURRENCY ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Currency Code: " + request.getCurrencyCode());
            
            // Validate currency code
            if (!isValidCurrency(request.getCurrencyCode())) {
                return CurrencyResponse.error("Unsupported currency code: " + request.getCurrencyCode());
            }
            
            // Find user by Firebase UID
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update user's preferred currency
            String oldCurrency = user.getPreferredCurrency();
            user.setPreferredCurrency(request.getCurrencyCode());
            userRepository.save(user);
            
            System.out.println("✅ Currency updated from " + oldCurrency + " to " + request.getCurrencyCode());
            
            // Get currency information
            Map<String, String> currencyInfo = SUPPORTED_CURRENCIES.get(request.getCurrencyCode());
            String currencyName = currencyInfo.get("name");
            String currencySymbol = currencyInfo.get("symbol");
            
            return CurrencyResponse.success(request.getCurrencyCode(), currencyName, currencySymbol);
            
        } catch (Exception e) {
            System.err.println("❌ Error updating user currency: " + e.getMessage());
            e.printStackTrace();
            return CurrencyResponse.error("Failed to update currency: " + e.getMessage());
        }
    }

    /**
     * Get user's current currency preference
     */
    public CurrencyResponse getUserCurrency(String firebaseUid) {
        try {
            System.out.println("=== GETTING USER CURRENCY ===");
            System.out.println("Firebase UID: " + firebaseUid);
            
            // Find user by Firebase UID
            User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String currencyCode = user.getPreferredCurrency();
            if (currencyCode == null || currencyCode.isEmpty()) {
                currencyCode = "USD"; // Default currency
            }
            
            // Get currency information
            Map<String, String> currencyInfo = SUPPORTED_CURRENCIES.get(currencyCode);
            if (currencyInfo == null) {
                currencyCode = "USD"; // Fallback to USD
                currencyInfo = SUPPORTED_CURRENCIES.get(currencyCode);
            }
            
            String currencyName = currencyInfo.get("name");
            String currencySymbol = currencyInfo.get("symbol");
            
            System.out.println("✅ User currency: " + currencyCode);
            
            return CurrencyResponse.success(currencyCode, currencyName, currencySymbol);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting user currency: " + e.getMessage());
            e.printStackTrace();
            return CurrencyResponse.error("Failed to get currency: " + e.getMessage());
        }
    }

    /**
     * Get all supported currencies
     */
    public Map<String, Map<String, String>> getSupportedCurrencies() {
        return new HashMap<>(SUPPORTED_CURRENCIES);
    }

    /**
     * Check if currency code is valid
     */
    public boolean isValidCurrency(String currencyCode) {
        return SUPPORTED_CURRENCIES.containsKey(currencyCode);
    }

    /**
     * Convert amount between currencies (simplified conversion)
     * In a real application, you would use a proper exchange rate API
     */
    public double convertAmount(double amount, String fromCurrency, String toCurrency) {
        // Sample exchange rates (in production, use real-time rates)
        Map<String, Double> exchangeRates = new HashMap<>();
        exchangeRates.put("USD", 1.0);
        exchangeRates.put("EUR", 0.85);
        exchangeRates.put("GBP", 0.73);
        exchangeRates.put("JPY", 110.0);
        exchangeRates.put("CAD", 1.25);
        exchangeRates.put("AUD", 1.35);
        exchangeRates.put("CHF", 0.92);
        exchangeRates.put("CNY", 6.45);
        exchangeRates.put("INR", 74.0);
        exchangeRates.put("BRL", 5.2);
        exchangeRates.put("MXN", 20.0);
        exchangeRates.put("KRW", 1180.0);
        exchangeRates.put("SGD", 1.35);
        exchangeRates.put("HKD", 7.8);
        exchangeRates.put("NZD", 1.42);
        exchangeRates.put("SEK", 8.6);
        exchangeRates.put("NOK", 8.9);
        exchangeRates.put("DKK", 6.3);
        exchangeRates.put("PLN", 3.9);
        exchangeRates.put("CZK", 21.7);
        exchangeRates.put("LKR", 320.0);

        try {
            if (fromCurrency.equals(toCurrency)) {
                return amount;
            }

            Double fromRate = exchangeRates.get(fromCurrency);
            Double toRate = exchangeRates.get(toCurrency);

            if (fromRate == null || toRate == null) {
                System.err.println("Exchange rate not found for: " + fromCurrency + " or " + toCurrency);
                return amount;
            }

            // Convert from source currency to USD, then to target currency
            double amountInUSD = amount / fromRate;
            double convertedAmount = amountInUSD * toRate;

            System.out.println("Currency conversion: " + amount + " " + fromCurrency + " = " + convertedAmount + " " + toCurrency);
            return convertedAmount;

        } catch (Exception e) {
            System.err.println("Error converting currency: " + e.getMessage());
            return amount;
        }
    }
}
