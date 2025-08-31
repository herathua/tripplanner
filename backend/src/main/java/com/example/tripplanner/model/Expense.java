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

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(value = 1, message = "Day number must be at least 1")
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;
    
    @NotNull(message = "Expense date is required")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;
    
    @NotBlank(message = "Expense description is required")
    @Size(min = 1, max = 255, message = "Description must be between 1 and 255 characters")
    @Column(nullable = false)
    private String description;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", inclusive = false, message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Currency currency = Currency.USD;
    
    @Column
    private String receiptUrl;
    
    @Column
    private String paymentMethod;
    
    @Column
    private String vendor;
    
    @Column
    private String location;
    
    @Column
    private String notes;
    
    @Column
    private Boolean reimbursable = false;
    
    @Column
    private Boolean reimbursed = false;
    
    @Column
    private String reimbursementReference;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status = ExpenseStatus.PAID;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Transient fields for JSON deserialization
    @Transient
    private Long tripId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    @JsonIgnore
    private Activity activity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    @JsonIgnore
    private Place place;
    
    // Enums
    public enum ExpenseCategory {
        ACCOMMODATION, FOOD, TRANSPORT, ACTIVITIES, SHOPPING, ENTERTAINMENT, 
        HEALTH, INSURANCE, VISAS, FEES, TIPS, OTHER
    }
    
    public enum Currency {
        USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, MXN, KRW, RUB, ZAR, SEK, NOK, DKK, PLN, CZK, HUF
    }
    
    public enum ExpenseStatus {
        PENDING, PAID, CANCELLED, REFUNDED
    }
    
    // Helper methods
    public boolean isReimbursable() {
        return Boolean.TRUE.equals(reimbursable);
    }
    
    public boolean isReimbursed() {
        return Boolean.TRUE.equals(reimbursed);
    }
    
    public boolean isPending() {
        return ExpenseStatus.PENDING.equals(status);
    }
    
    public boolean isPaid() {
        return ExpenseStatus.PAID.equals(status);
    }
    
    public boolean isCancelled() {
        return ExpenseStatus.CANCELLED.equals(status);
    }
    
    public boolean isRefunded() {
        return ExpenseStatus.REFUNDED.equals(status);
    }
    
    public boolean isOnDate(LocalDate date) {
        return expenseDate.equals(date);
    }
    
    public boolean isOnDayNumber(Integer day) {
        return dayNumber.equals(day);
    }
    
    public String getFormattedAmount() {
        return currency + " " + amount.toString();
    }
    
    public boolean isHighValue() {
        return amount.compareTo(BigDecimal.valueOf(100)) > 0;
    }
    
    public boolean isLowValue() {
        return amount.compareTo(BigDecimal.valueOf(10)) < 0;
    }
}
