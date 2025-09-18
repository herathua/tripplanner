package com.example.tripplanner.dto;

import com.example.tripplanner.model.Activity;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 10, message = "Start time must not exceed 10 characters")
    private String startTime;
    
    @Size(max = 10, message = "End time must not exceed 10 characters")
    private String endTime;
    
    @DecimalMin(value = "0.0", message = "Cost must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Cost must have at most 10 digits and 2 decimal places")
    private BigDecimal cost;
    
    @DecimalMin(value = "0.1", message = "Duration must be positive")
    @Digits(integer = 3, fraction = 1, message = "Duration must have at most 3 digits and 1 decimal place")
    private BigDecimal durationHours;
    
    @NotNull(message = "Type is required")
    private Activity.ActivityType type;
    
    @NotNull(message = "Status is required")
    private Activity.ActivityStatus status;
    
    // Associations
    private Long tripId;
    private Long itineraryId;
    private Integer dayNumber;
    private Long placeId; // Changed from String to Long to match backend expectations
    
    // Timestamps
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
