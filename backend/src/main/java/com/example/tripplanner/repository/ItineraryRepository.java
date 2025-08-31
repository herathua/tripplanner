package com.example.tripplanner.repository;

import com.example.tripplanner.model.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    
    List<Itinerary> findByTripIdOrderByDayNumberAsc(Long tripId);
    
    List<Itinerary> findByTripIdAndDateBetweenOrderByDateAsc(Long tripId, LocalDate startDate, LocalDate endDate);
    
    List<Itinerary> findByTripIdAndDayNumber(Long tripId, Integer dayNumber);
}
