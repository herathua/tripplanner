package com.example.tripplanner.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripPlanDTO {
    
    // Trip basic information
    @NotNull(message = "Trip ID is required")
    private Long tripId;
    
    @NotBlank(message = "Trip title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;
    
    @Size(min = 1, max = 100, message = "Destination must be between 1 and 100 characters")
    private String destination;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @DecimalMin(value = "0.0", message = "Budget must be non-negative")
    private BigDecimal budget;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    // Trip plan data
    @Valid
    private List<DayPlanDTO> days;
    
    @Valid
    private List<PlaceDTO> places;
    
    @Valid
    private List<ExpenseDTO> expenses;
    
    // Nested DTOs for day plans
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayPlanDTO {
        
        @NotNull(message = "Day number is required")
        @Min(value = 1, message = "Day number must be at least 1")
        private Integer dayNumber;
        
        @NotNull(message = "Date is required")
        private LocalDate date;
        
        @Size(max = 1000, message = "Notes must not exceed 1000 characters")
        private String notes;
        
        @Valid
        private List<ActivityDTO> activities;
    }
}
