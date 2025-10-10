package com.example.tripplanner.dto;

import com.example.tripplanner.model.Trip;
import com.fasterxml.jackson.annotation.JsonFormat;
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
public class TripDTO {
    
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;
    
    @NotBlank(message = "Destination is required")
    @Size(min = 1, max = 100, message = "Destination must be between 1 and 100 characters")
    private String destination;
    
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @DecimalMin(value = "0.0", message = "Budget must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Budget must have at most 10 digits and 2 decimal places")
    private BigDecimal budget;
    
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency = "USD";
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Trip.TripStatus status;
    private Trip.TripVisibility visibility;
    
    // Nested data structures matching frontend
    private ItineraryDataDTO itineraryData;
    private List<PlaceDTO> places;
    private List<ExpenseDTO> expenses;
    
    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private java.time.LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private java.time.LocalDateTime updatedAt;
    
    // User association
    private String firebaseUid;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItineraryDataDTO {
        private List<DayDTO> days;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DayDTO {
            private Integer dayNumber;
            private String date;
            private List<ActivityDTO> activities;
        }
    }
}
