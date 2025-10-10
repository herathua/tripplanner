package com.example.tripplanner.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyResponse {
    
    private String currencyCode;
    private String currencyName;
    private String currencySymbol;
    private boolean success;
    private String message;
    private String error;
    
    public static CurrencyResponse success(String currencyCode, String currencyName, String currencySymbol) {
        return new CurrencyResponse(currencyCode, currencyName, currencySymbol, true, "Currency updated successfully", null);
    }
    
    public static CurrencyResponse error(String error) {
        return new CurrencyResponse(null, null, null, false, null, error);
    }
}
