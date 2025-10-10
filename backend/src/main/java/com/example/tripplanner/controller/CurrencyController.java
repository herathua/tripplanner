package com.example.tripplanner.controller;

import com.example.tripplanner.dto.CurrencyResponse;
import com.example.tripplanner.dto.CurrencyUpdateRequest;
import com.example.tripplanner.service.CurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/currency")
@Tag(name = "Currency Management", description = "API endpoints for currency management")
public class CurrencyController {

    @Autowired
    private CurrencyService currencyService;

    @PutMapping("/user/{firebaseUid}")
    @Operation(summary = "Update user's preferred currency", 
               description = "Updates the preferred currency for a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Currency updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid currency code"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<CurrencyResponse> updateUserCurrency(
            @Parameter(description = "Firebase UID of the user") 
            @PathVariable String firebaseUid,
            @Valid @RequestBody CurrencyUpdateRequest request) {
        
        System.out.println("=== CURRENCY UPDATE REQUEST ===");
        System.out.println("Firebase UID: " + firebaseUid);
        System.out.println("Request: " + request);
        
        CurrencyResponse response = currencyService.updateUserCurrency(firebaseUid, request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{firebaseUid}")
    @Operation(summary = "Get user's preferred currency", 
               description = "Retrieves the current preferred currency for a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Currency retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<CurrencyResponse> getUserCurrency(
            @Parameter(description = "Firebase UID of the user") 
            @PathVariable String firebaseUid) {
        
        System.out.println("=== GET USER CURRENCY REQUEST ===");
        System.out.println("Firebase UID: " + firebaseUid);
        
        CurrencyResponse response = currencyService.getUserCurrency(firebaseUid);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/supported")
    @Operation(summary = "Get supported currencies", 
               description = "Retrieves a list of all supported currencies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Supported currencies retrieved successfully")
    })
    public ResponseEntity<Map<String, Map<String, String>>> getSupportedCurrencies() {
        System.out.println("=== GET SUPPORTED CURRENCIES REQUEST ===");
        
        Map<String, Map<String, String>> currencies = currencyService.getSupportedCurrencies();
        
        System.out.println("✅ Returning " + currencies.size() + " supported currencies");
        return ResponseEntity.ok(currencies);
    }

    @PostMapping("/convert")
    @Operation(summary = "Convert amount between currencies", 
               description = "Converts an amount from one currency to another")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conversion successful"),
        @ApiResponse(responseCode = "400", description = "Invalid currency codes"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> convertCurrency(
            @RequestParam double amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        
        System.out.println("=== CURRENCY CONVERSION REQUEST ===");
        System.out.println("Amount: " + amount);
        System.out.println("From: " + fromCurrency);
        System.out.println("To: " + toCurrency);
        
        try {
            // Validate currencies
            if (!currencyService.isValidCurrency(fromCurrency)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid source currency: " + fromCurrency
                ));
            }
            
            if (!currencyService.isValidCurrency(toCurrency)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid target currency: " + toCurrency
                ));
            }
            
            double convertedAmount = currencyService.convertAmount(amount, fromCurrency, toCurrency);
            
            System.out.println("✅ Conversion result: " + convertedAmount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "originalAmount", amount,
                "originalCurrency", fromCurrency,
                "convertedAmount", convertedAmount,
                "targetCurrency", toCurrency
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Conversion error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Conversion failed: " + e.getMessage()
            ));
        }
    }
}
