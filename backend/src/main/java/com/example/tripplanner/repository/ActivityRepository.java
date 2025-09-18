package com.example.tripplanner.repository;

import com.example.tripplanner.model.Activity;
import com.example.tripplanner.model.Trip;
import com.example.tripplanner.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
    List<Activity> findByTrip(Trip trip);
    
    List<Activity> findByItinerary(Itinerary itinerary);
    
    List<Activity> findByItineraryOrderByStartTimeAsc(Itinerary itinerary);
    
    List<Activity> findByTripAndStatus(Trip trip, Activity.ActivityStatus status);
    
    List<Activity> findByTripAndType(Trip trip, Activity.ActivityType type);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.startTime >= :startTime AND a.startTime <= :endTime")
    List<Activity> findByTripAndStartTimeBetween(@Param("trip") Trip trip, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.cost >= :minCost AND a.cost <= :maxCost")
    List<Activity> findByTripAndCostBetween(@Param("trip") Trip trip, @Param("minCost") java.math.BigDecimal minCost, @Param("maxCost") java.math.BigDecimal maxCost);
    
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.durationHours >= :minDuration AND a.durationHours <= :maxDuration")
    List<Activity> findByTripAndDurationBetween(@Param("trip") Trip trip, @Param("minDuration") Integer minDuration, @Param("maxDuration") Integer maxDuration);
    
    // Search activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND (a.name LIKE %:searchTerm% OR a.description LIKE %:searchTerm%)")
    List<Activity> findByTripAndSearchTerm(@Param("trip") Trip trip, @Param("searchTerm") String searchTerm);
    
    // Find by trip ID (for service layer)
    @Query("SELECT a FROM Activity a WHERE a.trip.id = :tripId")
    List<Activity> findByTripId(@Param("tripId") Long tripId);
    
    // Completed activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'COMPLETED'")
    List<Activity> findByTripAndCompleted(@Param("trip") Trip trip);
    
    // Cancelled activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'CANCELLED'")
    List<Activity> findByTripAndCancelled(@Param("trip") Trip trip);
    
    // Confirmed activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'CONFIRMED'")
    List<Activity> findByTripAndConfirmed(@Param("trip") Trip trip);
    
    // Planned activities
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.status = 'PLANNED'")
    List<Activity> findByTripAndPlanned(@Param("trip") Trip trip);
    
    // Check for time conflicts within an itinerary
    @Query("SELECT a FROM Activity a WHERE a.itinerary = :itinerary AND a.id != :excludeId AND " +
           "((a.startTime <= :startTime AND a.endTime > :startTime) OR " +
           "(a.startTime < :endTime AND a.endTime >= :endTime) OR " +
           "(a.startTime >= :startTime AND a.endTime <= :endTime))")
    List<Activity> findTimeConflicts(@Param("itinerary") Itinerary itinerary, 
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
    
    @Query("SELECT SUM(a.durationHours) FROM Activity a WHERE a.trip = :trip")
    Integer findTotalDurationByTrip(@Param("trip") Trip trip);
    
    // Activities by multiple types
    @Query("SELECT a FROM Activity a WHERE a.trip = :trip AND a.type IN :types")
    List<Activity> findByTripAndTypeIn(@Param("trip") Trip trip, @Param("types") List<Activity.ActivityType> types);
    
    // Activities by itinerary
    @Query("SELECT a FROM Activity a WHERE a.itinerary = :itinerary ORDER BY a.startTime ASC")
    List<Activity> findByItineraryOrderByStartTime(@Param("itinerary") Itinerary itinerary);
    
    // Find by itinerary ID
    @Query("SELECT a FROM Activity a WHERE a.itinerary.id = :itineraryId")
    List<Activity> findByItineraryId(@Param("itineraryId") Long itineraryId);
}
