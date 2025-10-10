package com.example.tripplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyUpdateRequest {
    
    @NotBlank(message = "Currency code is required")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be a 3-letter uppercase code (e.g., USD, EUR)")
    private String currencyCode;
    
    // Optional: Include amount to convert existing monetary values
    private Double convertExistingAmounts;
}
