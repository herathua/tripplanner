package com.example.tripplanner.dto;

import com.example.tripplanner.model.Expense;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {
    
    private Long id;
    
    @NotNull(message = "Day number is required")
    @Min(value = 1, message = "Day number must be at least 1")
    private Integer dayNumber;
    
    @NotBlank(message = "Expense date is required")
    private String expenseDate;
    
    @NotNull(message = "Category is required")
    private Expense.ExpenseCategory category;
    
    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 200, message = "Description must be between 1 and 200 characters")
    private String description;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most 10 digits and 2 decimal places")
    private BigDecimal amount;
    
    @NotNull(message = "Currency is required")
    private Expense.Currency currency;
    
    @Size(max = 500, message = "Receipt URL must not exceed 500 characters")
    private String receiptUrl;
    
    @Size(max = 50, message = "Payment method must not exceed 50 characters")
    private String paymentMethod;
    
    @Size(max = 100, message = "Vendor must not exceed 100 characters")
    private String vendor;
    
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    private Boolean reimbursable;
    private Boolean reimbursed;
    
    @Size(max = 100, message = "Reimbursement reference must not exceed 100 characters")
    private String reimbursementReference;
    
    @NotNull(message = "Status is required")
    private Expense.ExpenseStatus status;
    
    // Associations
    private Long tripId;
    private Long activityId;
    private Long placeId;
    
    // Timestamps
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
