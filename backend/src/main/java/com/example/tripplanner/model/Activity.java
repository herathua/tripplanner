package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(value = 1, message = "Day number must be at least 1")
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;
    
    @NotNull(message = "Activity date is required")
    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;
    
    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @NotBlank(message = "Activity description is required")
    @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Cost must have at most 10 digits and 2 decimal places")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost = BigDecimal.ZERO;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Duration must be non-negative")
    @Digits(integer = 3, fraction = 1, message = "Duration must have at most 3 digits and 1 decimal place")
    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal duration = BigDecimal.valueOf(2.0);
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type = ActivityType.VISIT;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityStatus status = ActivityStatus.PLANNED;
    
    @Column
    private String notes;
    
    @Column
    private String bookingReference;
    
    @Column
    private String contactInfo;
    
    @Column
    private String weatherDependent;
    
    @Column
    private String specialRequirements;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;
    
    // Enums
    public enum ActivityType {
        VISIT, MEAL, TRANSPORT, ACCOMMODATION, SHOPPING, ENTERTAINMENT, 
        CULTURAL, SPORTS, RELAXATION, WORK, OTHER
    }
    
    public enum ActivityStatus {
        PLANNED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED
    }
    
    // Helper methods
    public boolean isTimeConflict(Activity other) {
        if (!this.activityDate.equals(other.activityDate)) {
            return false;
        }
        
        LocalTime thisStart = this.startTime;
        LocalTime thisEnd = this.endTime != null ? this.endTime : thisStart.plusHours(this.duration.longValue());
        LocalTime otherStart = other.startTime;
        LocalTime otherEnd = other.endTime != null ? other.endTime : otherStart.plusHours(other.duration.longValue());
        
        return !(thisEnd.isBefore(otherStart) || thisStart.isAfter(otherEnd));
    }
    
    public boolean isWeatherDependent() {
        return "YES".equalsIgnoreCase(weatherDependent);
    }
    
    public boolean isCompleted() {
        return ActivityStatus.COMPLETED.equals(status);
    }
    
    public boolean isCancelled() {
        return ActivityStatus.CANCELLED.equals(status);
    }
    
    public LocalTime getCalculatedEndTime() {
        if (endTime != null) {
            return endTime;
        }
        return startTime.plusHours(duration.longValue());
    }
    
    public String getFormattedTimeRange() {
        LocalTime end = getCalculatedEndTime();
        return startTime.toString() + " - " + end.toString();
    }
    
    public boolean isOnDate(LocalDate date) {
        return activityDate.equals(date);
    }
    
    public boolean isOnDayNumber(Integer day) {
        return dayNumber.equals(day);
    }
}
