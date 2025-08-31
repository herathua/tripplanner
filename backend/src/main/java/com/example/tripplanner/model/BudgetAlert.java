package com.example.tripplanner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Trip is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @NotNull(message = "Alert type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;
    
    @NotNull(message = "Threshold percentage is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Threshold must be non-negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "Threshold must be at most 100")
    @Digits(integer = 3, fraction = 2, message = "Threshold must have at most 3 digits and 2 decimal places")
    @Column(name = "threshold_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal thresholdPercentage;
    
    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Current amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Current amount must have at most 10 digits and 2 decimal places")
    @Column(name = "current_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentAmount;
    
    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Budget amount must be non-negative")
    @Digits(integer = 10, fraction = 2, message = "Budget amount must have at most 10 digits and 2 decimal places")
    @Column(name = "budget_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal budgetAmount;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status = AlertStatus.ACTIVE;
    
    @Column(name = "triggered_at")
    private LocalDateTime triggeredAt;
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column
    private String actionTaken;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum AlertType {
        BUDGET_WARNING, BUDGET_EXCEEDED, DAILY_SPENDING_LIMIT, CATEGORY_LIMIT, 
        UNUSUAL_SPENDING, BUDGET_MILESTONE, SAVINGS_GOAL
    }
    
    public enum AlertStatus {
        ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
    }
    
    // Helper methods
    public boolean isActive() {
        return AlertStatus.ACTIVE.equals(status);
    }
    
    public boolean isAcknowledged() {
        return AlertStatus.ACKNOWLEDGED.equals(status);
    }
    
    public boolean isResolved() {
        return AlertStatus.RESOLVED.equals(status);
    }
    
    public boolean isDismissed() {
        return AlertStatus.DISMISSED.equals(status);
    }
    
    public BigDecimal getUsagePercentage() {
        if (budgetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return currentAmount.divide(budgetAmount, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
    
    public BigDecimal getRemainingBudget() {
        return budgetAmount.subtract(currentAmount);
    }
    
    public boolean isOverBudget() {
        return currentAmount.compareTo(budgetAmount) > 0;
    }
    
    public boolean isNearThreshold() {
        return getUsagePercentage().compareTo(thresholdPercentage) >= 0;
    }
    
    public void acknowledge() {
        this.status = AlertStatus.ACKNOWLEDGED;
        this.acknowledgedAt = LocalDateTime.now();
    }
    
    public void resolve() {
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }
    
    public void dismiss() {
        this.status = AlertStatus.DISMISSED;
    }
    
    public String getFormattedMessage() {
        if (message != null && !message.isEmpty()) {
            return message;
        }
        
        switch (alertType) {
            case BUDGET_WARNING:
                return String.format("Budget warning: You've used %.1f%% of your budget", getUsagePercentage());
            case BUDGET_EXCEEDED:
                return String.format("Budget exceeded: You've spent $%.2f more than your budget", 
                    currentAmount.subtract(budgetAmount));
            case DAILY_SPENDING_LIMIT:
                return "Daily spending limit reached";
            case CATEGORY_LIMIT:
                return "Category spending limit reached";
            case UNUSUAL_SPENDING:
                return "Unusual spending pattern detected";
            case BUDGET_MILESTONE:
                return "Budget milestone reached";
            case SAVINGS_GOAL:
                return "Savings goal achieved";
            default:
                return "Budget alert triggered";
        }
    }
    
    public boolean isUrgent() {
        return AlertType.BUDGET_EXCEEDED.equals(alertType) || 
               getUsagePercentage().compareTo(BigDecimal.valueOf(90)) >= 0;
    }
}
