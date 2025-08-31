package com.example.tripplanner.repository;

import com.example.tripplanner.model.Expense;
import com.example.tripplanner.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByTrip(Trip trip);
    
    List<Expense> findByTripOrderByExpenseDateDesc(Trip trip);
    
    List<Expense> findByTripAndDayNumber(Trip trip, Integer dayNumber);
    
    List<Expense> findByTripAndExpenseDate(Trip trip, LocalDate expenseDate);
    
    List<Expense> findByTripAndCategory(Trip trip, Expense.ExpenseCategory category);
    
    List<Expense> findByTripAndStatus(Trip trip, Expense.ExpenseStatus status);
    
    List<Expense> findByTripAndCurrency(Trip trip, Expense.Currency currency);
    
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.amount >= :minAmount AND e.amount <= :maxAmount")
    List<Expense> findByTripAndAmountBetween(@Param("trip") Trip trip, @Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.amount >= :amount")
    List<Expense> findByTripAndAmountGreaterThanEqual(@Param("trip") Trip trip, @Param("amount") BigDecimal amount);
    
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.amount <= :amount")
    List<Expense> findByTripAndAmountLessThanEqual(@Param("trip") Trip trip, @Param("amount") BigDecimal amount);
    
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findByTripAndDateRange(@Param("trip") Trip trip, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Search expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND (e.description LIKE %:searchTerm% OR e.vendor LIKE %:searchTerm% OR e.location LIKE %:searchTerm% OR e.notes LIKE %:searchTerm%)")
    List<Expense> findByTripAndSearchTerm(@Param("trip") Trip trip, @Param("searchTerm") String searchTerm);
    
    // Reimbursable expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.reimbursable = true")
    List<Expense> findByTripAndReimbursable(@Param("trip") Trip trip);
    
    // Reimbursed expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.reimbursed = true")
    List<Expense> findByTripAndReimbursed(@Param("trip") Trip trip);
    
    // Pending reimbursement
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.reimbursable = true AND e.reimbursed = false")
    List<Expense> findByTripAndPendingReimbursement(@Param("trip") Trip trip);
    
    // High value expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.amount >= :threshold")
    List<Expense> findByTripAndHighValue(@Param("trip") Trip trip, @Param("threshold") BigDecimal threshold);
    
    // Low value expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.amount <= :threshold")
    List<Expense> findByTripAndLowValue(@Param("trip") Trip trip, @Param("threshold") BigDecimal threshold);
    
    // Expenses with receipts
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.receiptUrl IS NOT NULL AND e.receiptUrl != ''")
    List<Expense> findByTripAndHasReceipt(@Param("trip") Trip trip);
    
    // Expenses without receipts
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND (e.receiptUrl IS NULL OR e.receiptUrl = '')")
    List<Expense> findByTripAndNoReceipt(@Param("trip") Trip trip);
    
    // Expenses by payment method
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.paymentMethod = :paymentMethod")
    List<Expense> findByTripAndPaymentMethod(@Param("trip") Trip trip, @Param("paymentMethod") String paymentMethod);
    
    // Expenses by vendor
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.vendor LIKE %:vendor%")
    List<Expense> findByTripAndVendorContaining(@Param("trip") Trip trip, @Param("vendor") String vendor);
    
    // Expenses by location
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.location LIKE %:location%")
    List<Expense> findByTripAndLocationContaining(@Param("trip") Trip trip, @Param("location") String location);
    
    // Recent expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.expenseDate >= :since ORDER BY e.expenseDate DESC")
    List<Expense> findRecentExpenses(@Param("trip") Trip trip, @Param("since") LocalDate since);
    
    // Today's expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.expenseDate = :today")
    List<Expense> findTodaysExpenses(@Param("trip") Trip trip, @Param("today") LocalDate today);
    
    // This week's expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.expenseDate BETWEEN :weekStart AND :weekEnd")
    List<Expense> findThisWeeksExpenses(@Param("trip") Trip trip, @Param("weekStart") LocalDate weekStart, @Param("weekEnd") LocalDate weekEnd);
    
    // This month's expenses
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.expenseDate BETWEEN :monthStart AND :monthEnd")
    List<Expense> findThisMonthsExpenses(@Param("trip") Trip trip, @Param("monthStart") LocalDate monthStart, @Param("monthEnd") LocalDate monthEnd);
    
    // Statistics
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip = :trip")
    Optional<BigDecimal> findTotalAmountByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip = :trip AND e.category = :category")
    Optional<BigDecimal> findTotalAmountByTripAndCategory(@Param("trip") Trip trip, @Param("category") Expense.ExpenseCategory category);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip = :trip AND e.expenseDate = :date")
    Optional<BigDecimal> findTotalAmountByTripAndDate(@Param("trip") Trip trip, @Param("date") LocalDate date);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.trip = :trip AND e.expenseDate BETWEEN :startDate AND :endDate")
    Optional<BigDecimal> findTotalAmountByTripAndDateRange(@Param("trip") Trip trip, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT AVG(e.amount) FROM Expense e WHERE e.trip = :trip")
    Optional<BigDecimal> findAverageAmountByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT MAX(e.amount) FROM Expense e WHERE e.trip = :trip")
    Optional<BigDecimal> findMaxAmountByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT MIN(e.amount) FROM Expense e WHERE e.trip = :trip")
    Optional<BigDecimal> findMinAmountByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.trip = :trip")
    long countByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT COUNT(e) FROM Expense e WHERE e.trip = :trip AND e.category = :category")
    long countByTripAndCategory(@Param("trip") Trip trip, @Param("category") Expense.ExpenseCategory category);
    
    @Query("SELECT e.category, COUNT(e) FROM Expense e WHERE e.trip = :trip GROUP BY e.category")
    List<Object[]> findCategoryCountsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.trip = :trip GROUP BY e.category")
    List<Object[]> findCategoryTotalsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT e.currency, SUM(e.amount) FROM Expense e WHERE e.trip = :trip GROUP BY e.currency")
    List<Object[]> findCurrencyTotalsByTrip(@Param("trip") Trip trip);
    
    // Expenses by multiple categories
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.category IN :categories")
    List<Expense> findByTripAndCategoryIn(@Param("trip") Trip trip, @Param("categories") List<Expense.ExpenseCategory> categories);
    
    // Expenses by multiple currencies
    @Query("SELECT e FROM Expense e WHERE e.trip = :trip AND e.currency IN :currencies")
    List<Expense> findByTripAndCurrencyIn(@Param("trip") Trip trip, @Param("currencies") List<Expense.Currency> currencies);
    
    // Daily expense totals
    @Query("SELECT e.expenseDate, SUM(e.amount) FROM Expense e WHERE e.trip = :trip GROUP BY e.expenseDate ORDER BY e.expenseDate")
    List<Object[]> findDailyTotalsByTrip(@Param("trip") Trip trip);
    
    // Monthly expense totals
    @Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) FROM Expense e WHERE e.trip = :trip GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) ORDER BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
    List<Object[]> findMonthlyTotalsByTrip(@Param("trip") Trip trip);

    List<Expense> findByTripAndExpenseType(Trip trip, Expense.ExpenseType expenseType);
}
