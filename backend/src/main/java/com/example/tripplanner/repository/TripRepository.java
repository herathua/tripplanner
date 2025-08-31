package com.example.tripplanner.repository;

import com.example.tripplanner.model.Trip;
import com.example.tripplanner.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    List<Trip> findByUser(User user);
    
    Page<Trip> findByUser(User user, Pageable pageable);
    
    List<Trip> findByUserAndStatus(User user, Trip.TripStatus status);
    
    List<Trip> findByUserAndVisibility(User user, Trip.TripVisibility visibility);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.startDate >= :startDate")
    List<Trip> findByUserAndStartDateAfter(@Param("user") User user, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.endDate <= :endDate")
    List<Trip> findByUserAndEndDateBefore(@Param("user") User user, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.startDate BETWEEN :startDate AND :endDate")
    List<Trip> findByUserAndStartDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.destination LIKE %:destination%")
    List<Trip> findByUserAndDestinationContaining(@Param("user") User user, @Param("destination") String destination);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.title LIKE %:title%")
    List<Trip> findByUserAndTitleContaining(@Param("user") User user, @Param("title") String title);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.budget >= :minBudget AND t.budget <= :maxBudget")
    List<Trip> findByUserAndBudgetBetween(@Param("user") User user, @Param("minBudget") BigDecimal minBudget, @Param("maxBudget") BigDecimal maxBudget);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.budget >= :budget")
    List<Trip> findByUserAndBudgetGreaterThanEqual(@Param("user") User user, @Param("budget") BigDecimal budget);
    
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.budget <= :budget")
    List<Trip> findByUserAndBudgetLessThanEqual(@Param("user") User user, @Param("budget") BigDecimal budget);
    
    // Search across all fields
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND (t.title LIKE %:searchTerm% OR t.destination LIKE %:searchTerm% OR t.description LIKE %:searchTerm%)")
    List<Trip> findByUserAndSearchTerm(@Param("user") User user, @Param("searchTerm") String searchTerm);
    
    // Public trips
    List<Trip> findByVisibility(Trip.TripVisibility visibility);
    
    @Query("SELECT t FROM Trip t WHERE t.visibility = 'PUBLIC' AND t.destination LIKE %:destination%")
    List<Trip> findPublicTripsByDestination(@Param("destination") String destination);
    
    // Budget analysis
    @Query("SELECT AVG(t.budget) FROM Trip t WHERE t.user = :user")
    Optional<BigDecimal> findAverageBudgetByUser(@Param("user") User user);
    
    @Query("SELECT SUM(t.budget) FROM Trip t WHERE t.user = :user")
    Optional<BigDecimal> findTotalBudgetByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(t) FROM Trip t WHERE t.user = :user AND t.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Trip.TripStatus status);
    
    // Upcoming trips
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.startDate >= :today ORDER BY t.startDate ASC")
    List<Trip> findUpcomingTrips(@Param("user") User user, @Param("today") LocalDate today);
    
    // Recent trips
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.endDate <= :today ORDER BY t.endDate DESC")
    List<Trip> findRecentTrips(@Param("user") User user, @Param("today") LocalDate today);
    
    // Active trips
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.startDate <= :today AND t.endDate >= :today")
    List<Trip> findActiveTrips(@Param("user") User user, @Param("today") LocalDate today);
    
    // Over-budget trips
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND EXISTS (SELECT 1 FROM Expense e WHERE e.trip = t GROUP BY e.trip HAVING SUM(e.amount) > t.budget)")
    List<Trip> findOverBudgetTrips(@Param("user") User user);
    
    // Trips with expenses
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND EXISTS (SELECT 1 FROM Expense e WHERE e.trip = t)")
    List<Trip> findTripsWithExpenses(@Param("user") User user);
    
    // Trips without expenses
    @Query("SELECT t FROM Trip t WHERE t.user = :user AND NOT EXISTS (SELECT 1 FROM Expense e WHERE e.trip = t)")
    List<Trip> findTripsWithoutExpenses(@Param("user") User user);
    
    // General search methods (for controllers)
    @Query("SELECT t FROM Trip t WHERE t.destination LIKE %:destination% OR t.title LIKE %:title%")
    List<Trip> findByDestinationContainingIgnoreCaseOrTitleContainingIgnoreCase(@Param("destination") String destination, @Param("title") String title);
    
    List<Trip> findByStatus(Trip.TripStatus status);
}
