package com.example.tripplanner.controller;

import com.example.tripplanner.model.Expense;
import com.example.tripplanner.model.Trip;
import com.example.tripplanner.repository.ExpenseRepository;
import com.example.tripplanner.repository.TripRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense Management", description = "APIs for managing trip expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get expenses by trip ID", description = "Retrieve all expenses for a specific trip")
    public ResponseEntity<List<Expense>> getExpensesByTripId(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Expense> expenses = expenseRepository.findByTripOrderByExpenseDateDesc(trip.get());
            return ResponseEntity.ok(expenses);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID", description = "Retrieve a specific expense by its ID")
    public ResponseEntity<Expense> getExpenseById(
            @Parameter(description = "ID of the expense to retrieve") 
            @PathVariable Long id) {
        Optional<Expense> expense = expenseRepository.findById(id);
        return expense.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new expense", description = "Create a new expense for a trip")
    public ResponseEntity<?> createExpense(
            @Parameter(description = "Expense object to create") 
            @RequestBody Expense expense) {
        try {
            System.out.println("Received expense request: expenseId=" + expense.getId() + ", tripId=" + expense.getTripId() + ", amount=" + expense.getAmount() + ", description=" + expense.getDescription());
            // If tripId is provided in the request, find the trip and set it
            if (expense.getTrip() == null && expense.getTripId() != null) {
                Optional<Trip> trip = tripRepository.findById(expense.getTripId());
                if (trip.isPresent()) {
                    expense.setTrip(trip.get());
                    System.out.println("Found and set trip: " + trip.get().getId());
                } else {
                    System.err.println("Trip not found with ID: " + expense.getTripId());
                    return ResponseEntity.badRequest().build();
                }
            }
            if (expense.getExpenseType() == null) {
                expense.setExpenseType(Expense.ExpenseType.DEFAULT);
            }
            Expense savedExpense = expenseRepository.save(expense);
            System.out.println("Saved expense with id: " + savedExpense.getId());
            // Create a simple response object to avoid lazy loading issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedExpense.getId());
            response.put("dayNumber", savedExpense.getDayNumber());
            response.put("expenseDate", savedExpense.getExpenseDate());
            response.put("category", savedExpense.getCategory());
            response.put("description", savedExpense.getDescription());
            response.put("amount", savedExpense.getAmount());
            response.put("currency", savedExpense.getCurrency());
            response.put("status", savedExpense.getStatus());
            response.put("tripId", savedExpense.getTripId());
            response.put("expenseType", savedExpense.getExpenseType());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating expense: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            if (e.getMessage() != null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
            } else {
                return ResponseEntity.internalServerError().build();
            }
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.append(fieldName).append(": ").append(errorMessage).append("; ");
        });
        System.err.println("Validation errors: " + errors.toString());
        return ResponseEntity.badRequest().body(errors.toString());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an expense", description = "Update an existing expense by its ID")
    public ResponseEntity<Expense> updateExpense(
            @Parameter(description = "ID of the expense to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated expense object") 
            @RequestBody Expense expenseDetails) {
        Optional<Expense> existingExpense = expenseRepository.findById(id);
        if (existingExpense.isPresent()) {
            Expense expense = existingExpense.get();
            expense.setDayNumber(expenseDetails.getDayNumber());
            expense.setExpenseDate(expenseDetails.getExpenseDate());
            expense.setCategory(expenseDetails.getCategory());
            expense.setDescription(expenseDetails.getDescription());
            expense.setAmount(expenseDetails.getAmount());
            expense.setCurrency(expenseDetails.getCurrency());
            expense.setReceiptUrl(expenseDetails.getReceiptUrl());
            expense.setPaymentMethod(expenseDetails.getPaymentMethod());
            expense.setVendor(expenseDetails.getVendor());
            expense.setLocation(expenseDetails.getLocation());
            expense.setNotes(expenseDetails.getNotes());
            expense.setReimbursable(expenseDetails.getReimbursable());
            expense.setReimbursed(expenseDetails.getReimbursed());
            expense.setReimbursementReference(expenseDetails.getReimbursementReference());
            expense.setStatus(expenseDetails.getStatus());
            
            Expense updatedExpense = expenseRepository.save(expense);
            return ResponseEntity.ok(updatedExpense);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense", description = "Delete an expense by its ID")
    public ResponseEntity<Void> deleteExpense(
            @Parameter(description = "ID of the expense to delete") 
            @PathVariable Long id) {
        if (expenseRepository.existsById(id)) {
            expenseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/total")
    @Operation(summary = "Get total expenses for a trip", description = "Get the total amount spent for a specific trip")
    public ResponseEntity<BigDecimal> getTotalExpensesByTripId(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            Optional<BigDecimal> total = expenseRepository.findTotalAmountByTrip(trip.get());
            return ResponseEntity.ok(total.orElse(BigDecimal.ZERO));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/category/{category}")
    @Operation(summary = "Get expenses by trip and category", description = "Retrieve expenses for a trip filtered by category")
    public ResponseEntity<List<Expense>> getExpensesByTripAndCategory(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "Category to filter by") 
            @PathVariable Expense.ExpenseCategory category) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Expense> expenses = expenseRepository.findByTripAndCategory(trip.get(), category);
            return ResponseEntity.ok(expenses);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/day/{dayNumber}")
    @Operation(summary = "Get expenses by trip and day number", description = "Retrieve expenses for a specific day of a trip")
    public ResponseEntity<List<Expense>> getExpensesByTripAndDay(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "Day number") 
            @PathVariable Integer dayNumber) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Expense> expenses = expenseRepository.findByTripAndDayNumber(trip.get(), dayNumber);
            return ResponseEntity.ok(expenses);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/type/{expenseType}")
    @Operation(summary = "Get expenses by trip and type", description = "Retrieve expenses for a trip filtered by type")
    public ResponseEntity<List<Expense>> getExpensesByTripAndType(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "Type to filter by") 
            @PathVariable Expense.ExpenseType expenseType) {
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Expense> expenses = expenseRepository.findByTripAndExpenseType(trip.get(), expenseType);
            return ResponseEntity.ok(expenses);
        }
        return ResponseEntity.notFound().build();
    }
}
