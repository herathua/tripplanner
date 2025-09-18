package com.example.tripplanner.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDTO {
    
    private Long id;
    
    @NotNull(message = "Day number is required")
    @Min(value = 1, message = "Day number must be at least 1")
    private Integer dayNumber;
    
    @NotBlank(message = "Date is required")
    private String date;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    @NotNull(message = "Trip ID is required")
    private Long tripId;
    
    // Timestamps
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
