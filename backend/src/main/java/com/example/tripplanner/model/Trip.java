package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Trip title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Destination is required")
    @Size(min = 1, max = 255, message = "Destination must be between 1 and 255 characters")
    @Column(nullable = false)
    private String destination;
    
    @NotNull(message = "Start date is required")
    // @FutureOrPresent(message = "Start date must be today or in the future")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    // @Future(message = "End date must be in the future")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @NotNull(message = "Budget is required")
    // @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    // @Digits(integer = 10, fraction = 2, message = "Budget must have at most 10 digits and 2 decimal places")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budget;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status = TripStatus.PLANNING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripVisibility visibility = TripVisibility.PRIVATE;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Place> places = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Itinerary> itineraries = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Expense> expenses = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private Set<TripShare> shares = new HashSet<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<BudgetAlert> budgetAlerts = new ArrayList<>();
    
    // Enums
    public enum TripStatus {
        PLANNING, ACTIVE, COMPLETED, CANCELLED
    }
    
    public enum TripVisibility {
        PRIVATE, SHARED, PUBLIC
    }
    
    // Helper methods
    @JsonIgnore
    public void addItinerary(Itinerary itinerary) {
        itineraries.add(itinerary);
        itinerary.setTrip(this);
    }
    
    @JsonIgnore
    public void removeItinerary(Itinerary itinerary) {
        itineraries.remove(itinerary);
        itinerary.setTrip(null);
    }
    
    @JsonIgnore
    public void addPlace(Place place) {
        places.add(place);
        place.setTrip(this);
    }
    
    @JsonIgnore
    public void removePlace(Place place) {
        places.remove(place);
        place.setTrip(null);
    }
    
    @JsonIgnore
    public void addExpense(Expense expense) {
        expenses.add(expense);
        expense.setTrip(this);
    }
    
    @JsonIgnore
    public void removeExpense(Expense expense) {
        expenses.remove(expense);
        expense.setTrip(null);
    }
    
    @JsonIgnore
    public BigDecimal getTotalExpenses() {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @JsonIgnore
    public BigDecimal getRemainingBudget() {
        return budget.subtract(getTotalExpenses());
    }
    
    @JsonIgnore
    public double getBudgetUsagePercentage() {
        if (budget.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return getTotalExpenses().divide(budget, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
    
    @JsonIgnore
    public boolean isOverBudget() {
        return getTotalExpenses().compareTo(budget) > 0;
    }
    
    @JsonIgnore
    public boolean isNearBudgetLimit(double threshold) {
        return getBudgetUsagePercentage() >= threshold;
    }
}
