package com.example.tripplanner.controller;

import com.example.tripplanner.dto.ExpenseDTO;
import com.example.tripplanner.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense Management", description = "APIs for managing expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private TripService tripService;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get expenses by trip ID", description = "Retrieve all expenses for a specific trip")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId) {
        List<ExpenseDTO> expenses = tripService.getExpensesByTripId(tripId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID", description = "Retrieve a specific expense by its ID")
    public ResponseEntity<ExpenseDTO> getExpenseById(
            @Parameter(description = "ID of the expense to retrieve")
            @PathVariable Long id) {
        // TODO: Implement get expense by ID
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create a new expense", description = "Create a new expense")
    public ResponseEntity<ExpenseDTO> createExpense(
            @Parameter(description = "Expense object to create")
            @Valid @RequestBody ExpenseDTO expenseDTO) {
        try {
            System.out.println("=== CREATING EXPENSE ===");
            System.out.println("Expense DTO: " + expenseDTO);
            
            ExpenseDTO createdExpense = tripService.createExpense(expenseDTO);
            System.out.println("✅ Expense created successfully with ID: " + createdExpense.getId());
            return ResponseEntity.ok(createdExpense);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING EXPENSE ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update expense", description = "Update an existing expense")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @Parameter(description = "ID of the expense to update")
            @PathVariable Long id,
            @Parameter(description = "Updated expense object")
            @Valid @RequestBody ExpenseDTO expenseDTO) {
        // TODO: Implement update expense
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense", description = "Delete an expense by its ID")
    public ResponseEntity<Void> deleteExpense(
            @Parameter(description = "ID of the expense to delete")
            @PathVariable Long id) {
        // TODO: Implement delete expense
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/total")
    @Operation(summary = "Get total expenses for trip", description = "Get the total amount of expenses for a trip")
    public ResponseEntity<Double> getTotalExpensesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId) {
        // TODO: Implement total calculation
        return ResponseEntity.ok(0.0);
    }

    @GetMapping("/trip/{tripId}/category/{category}")
    @Operation(summary = "Get expenses by trip and category", description = "Get expenses filtered by trip and category")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTripAndCategory(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId,
            @Parameter(description = "Expense category")
            @PathVariable String category) {
        // TODO: Implement category filtering
        List<ExpenseDTO> expenses = tripService.getExpensesByTripId(tripId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/trip/{tripId}/day/{dayNumber}")
    @Operation(summary = "Get expenses by trip and day", description = "Get expenses filtered by trip and day number")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTripAndDay(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId,
            @Parameter(description = "Day number")
            @PathVariable Integer dayNumber) {
        // TODO: Implement day filtering
        List<ExpenseDTO> expenses = tripService.getExpensesByTripId(tripId);
        return ResponseEntity.ok(expenses);
    }
}