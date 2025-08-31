package com.example.tripplanner.repository;

import com.example.tripplanner.model.Activity;
import com.example.tripplanner.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    List<Activity> findByTrip(Trip trip);
    
    List<Activity> findByTripOrderByDayNumberAscStartTimeAsc(Trip trip);
    
    List<Activity> findByTripAndDayNumber(Trip trip, Integer dayNumber);
    
    List<Activity> findByTripAndDayNumberOrderByStartTimeAsc(Trip trip, Integer dayNumber);
    
    List<Activity> findByTripAndActivityDate(Trip trip, LocalDate activityDate);
    
    List<Activity> findByTripAndActivityDateOrderByStartTimeAsc(Trip trip, LocalDate activityDate);
    
    List<Activity> findByTripAndStatus(Trip trip, Activity.ActivityStatus status);
    
    List<Activity> findByTripAndType(Trip trip, Activity.ActivityType type);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.startTime >= :startTime AND a.startTime <= :endTime")
    List<Activity> findByTripAndStartTimeBetween(@Param("trip") Trip trip, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.activityDate = :date AND a.startTime >= :startTime AND a.startTime <= :endTime")
    List<Activity> findByTripAndDateAndTimeBetween(@Param("trip") Trip trip, @Param("date") LocalDate date, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.cost >= :minCost AND a.cost <= :maxCost")
    List<Activity> findByTripAndCostBetween(@Param("trip") Trip trip, @Param("minCost") java.math.BigDecimal minCost, @Param("maxCost") java.math.BigDecimal maxCost);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.duration >= :minDuration AND a.duration <= :maxDuration")
    List<Activity> findByTripAndDurationBetween(@Param("trip") Trip trip, @Param("minDuration") java.math.BigDecimal minDuration, @Param("maxDuration") java.math.BigDecimal maxDuration);
    
    // Search activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND (a.description LIKE %:searchTerm% OR a.notes LIKE %:searchTerm%)")
    List<Activity> findByTripAndSearchTerm(@Param("trip") Trip trip, @Param("searchTerm") String searchTerm);
    
    // Weather dependent activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.weatherDependent = 'YES'")
    List<Activity> findByTripAndWeatherDependent(@Param("trip") Trip trip);
    
    // Activities with booking references
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.bookingReference IS NOT NULL AND a.bookingReference != ''")
    List<Activity> findByTripAndHasBookingReference(@Param("trip") Trip trip);
    
    // Activities with contact info
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.contactInfo IS NOT NULL AND a.contactInfo != ''")
    List<Activity> findByTripAndHasContactInfo(@Param("trip") Trip trip);
    
    // Completed activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'COMPLETED'")
    List<Activity> findByTripAndCompleted(@Param("trip") Trip trip);
    
    // Cancelled activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'CANCELLED'")
    List<Activity> findByTripAndCancelled(@Param("trip") Trip trip);
    
    // Upcoming activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.activityDate >= :today ORDER BY a.activityDate ASC, a.startTime ASC")
    List<Activity> findUpcomingActivities(@Param("trip") Trip trip, @Param("today") LocalDate today);
    
    // Today's activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.activityDate = :today ORDER BY a.startTime ASC")
    List<Activity> findTodaysActivities(@Param("trip") Trip trip, @Param("today") LocalDate today);
    
    // Activities by date range
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.activityDate BETWEEN :startDate AND :endDate ORDER BY a.activityDate ASC, a.startTime ASC")
    List<Activity> findByTripAndDateRange(@Param("trip") Trip trip, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Check for time conflicts
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.activityDate = :date AND a.id != :excludeId AND " +
           "((a.startTime <= :startTime AND a.endTime > :startTime) OR " +
           "(a.startTime < :endTime AND a.endTime >= :endTime) OR " +
           "(a.startTime >= :startTime AND a.endTime <= :endTime))")
    List<Activity> findTimeConflicts(@Param("trip") Trip trip, @Param("date") LocalDate date, 
                                   @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime, 
                                   @Param("excludeId") Long excludeId);
    
    // Statistics
    @Query("SELECT COUNT(a) FROM Activity a WHERE a.trip = :trip AND a.status = :status")
    long countByTripAndStatus(@Param("trip") Trip trip, @Param("status") Activity.ActivityStatus status);
    
    @Query("SELECT COUNT(a) FROM Activity a WHERE a.trip = :trip AND a.type = :type")
    long countByTripAndType(@Param("trip") Trip trip, @Param("type") Activity.ActivityType type);
    
    @Query("SELECT a.type, COUNT(a) FROM Activity a WHERE a.trip = :trip GROUP BY a.type")
    List<Object[]> findTypeCountsByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT SUM(a.cost) FROM Activity a WHERE a.trip = :trip")
    java.math.BigDecimal findTotalCostByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT SUM(a.duration) FROM Activity a WHERE a.trip = :trip")
    java.math.BigDecimal findTotalDurationByTrip(@Param("trip") Trip trip);
    
    // Activities by multiple types
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.type IN :types")
    List<Activity> findByTripAndTypeIn(@Param("trip") Trip trip, @Param("types") List<Activity.ActivityType> types);
    
    // Activities with special requirements
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.specialRequirements IS NOT NULL AND a.specialRequirements != ''")
    List<Activity> findByTripAndHasSpecialRequirements(@Param("trip") Trip trip);
}
