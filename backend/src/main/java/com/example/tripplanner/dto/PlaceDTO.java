package com.example.tripplanner.dto;

import com.example.tripplanner.model.Place;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {
    
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;
    
    @NotBlank(message = "Location is required")
    @Size(min = 1, max = 200, message = "Location must be between 1 and 200 characters")
    private String location;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Category is required")
    private Place.PlaceCategory category;
    
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    @DecimalMin(value = "0.0", message = "Cost must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Cost must have at most 10 digits and 2 decimal places")
    private BigDecimal cost;
    
    @DecimalMin(value = "0.1", message = "Duration must be positive")
    @Digits(integer = 3, fraction = 1, message = "Duration must have at most 3 digits and 1 decimal place")
    private BigDecimal duration;
    
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Digits(integer = 3, fraction = 6, message = "Latitude must have at most 3 digits and 6 decimal places")
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Digits(integer = 3, fraction = 6, message = "Longitude must have at most 3 digits and 6 decimal places")
    private BigDecimal longitude;
    
    private List<String> photos;
    
    // Trip association
    private Long tripId;
    
    // Timestamps
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
