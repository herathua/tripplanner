package com.example.tripplanner.repository;

import com.example.tripplanner.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    
    List<Itinerary> findByTrip_IdOrderByDayNumberAsc(Long tripId);
    
    List<Itinerary> findByTrip_IdAndDateBetweenOrderByDateAsc(Long tripId, LocalDate startDate, LocalDate endDate);
    
    // Find by trip ID (for service layer)
    @Query("SELECT i FROM Itinerary i WHERE i.trip.id = :tripId")
    List<Itinerary> findByTripId(@Param("tripId") Long tripId);
    
    // Find by trip ID and day number
    @Query("SELECT i FROM Itinerary i WHERE i.trip.id = :tripId AND i.dayNumber = :dayNumber")
    Optional<Itinerary> findByTripIdAndDayNumber(@Param("tripId") Long tripId, @Param("dayNumber") Integer dayNumber);
}
