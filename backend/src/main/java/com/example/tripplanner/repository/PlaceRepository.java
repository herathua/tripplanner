package com.example.tripplanner.repository;

import com.example.tripplanner.model.Place;
import com.example.tripplanner.model.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {
    
    List<Place> findByTrip(Trip trip);
    
    Page<Place> findByTrip(Trip trip, Pageable pageable);
    
    List<Place> findByTripAndCategory(Trip trip, Place.PlaceCategory category);
    
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.rating >= :minRating")
    List<Place> findByTripAndRatingGreaterThanEqual(@Param("trip") Trip trip, @Param("minRating") Integer minRating);
    
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.cost >= :minCost AND p.cost <= :maxCost")
    List<Place> findByTripAndCostBetween(@Param("trip") Trip trip, @Param("minCost") BigDecimal minCost, @Param("maxCost") BigDecimal maxCost);
    
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.cost <= :maxCost")
    List<Place> findByTripAndCostLessThanEqual(@Param("trip") Trip trip, @Param("maxCost") BigDecimal maxCost);
    
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.duration >= :minDuration AND p.duration <= :maxDuration")
    List<Place> findByTripAndDurationBetween(@Param("trip") Trip trip, @Param("minDuration") BigDecimal minDuration, @Param("maxDuration") BigDecimal maxDuration);
    
    // Search by name or location
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND (p.name LIKE %:searchTerm% OR p.location LIKE %:searchTerm% OR p.description LIKE %:searchTerm%)")
    List<Place> findByTripAndSearchTerm(@Param("trip") Trip trip, @Param("searchTerm") String searchTerm);
    
    // Find by trip ID (for service layer)
    @Query("SELECT p FROM Place p WHERE p.trip.id = :tripId")
    List<Place> findByTripId(@Param("tripId") Long tripId);
    
    // Search by name
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.name LIKE %:name%")
    List<Place> findByTripAndNameContaining(@Param("trip") Trip trip, @Param("name") String name);
    
    // Search by location
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.location LIKE %:location%")
    List<Place> findByTripAndLocationContaining(@Param("trip") Trip trip, @Param("location") String location);
    
    // Search by city
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.city LIKE %:city%")
    List<Place> findByTripAndCityContaining(@Param("trip") Trip trip, @Param("city") String city);
    
    // Search by country
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.country LIKE %:country%")
    List<Place> findByTripAndCountryContaining(@Param("trip") Trip trip, @Param("country") String country);
    
    // Geographic search (within radius)
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(p.latitude)))) <= :radius")
    List<Place> findByTripAndLocationWithinRadius(@Param("trip") Trip trip, @Param("lat") BigDecimal lat, @Param("lng") BigDecimal lng, @Param("radius") double radius);
    
    // Places with photos
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND SIZE(p.photos) > 0")
    List<Place> findByTripAndHasPhotos(@Param("trip") Trip trip);
    
    // Places without photos
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND SIZE(p.photos) = 0")
    List<Place> findByTripAndNoPhotos(@Param("trip") Trip trip);
    
    // Places with website
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.website IS NOT NULL AND p.website != ''")
    List<Place> findByTripAndHasWebsite(@Param("trip") Trip trip);
    
    // Places with phone number
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.phoneNumber IS NOT NULL AND p.phoneNumber != ''")
    List<Place> findByTripAndHasPhoneNumber(@Param("trip") Trip trip);
    
    // Top rated places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.rating DESC")
    List<Place> findByTripOrderByRatingDesc(@Param("trip") Trip trip);
    
    // Most expensive places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.cost DESC")
    List<Place> findByTripOrderByCostDesc(@Param("trip") Trip trip);
    
    // Least expensive places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.cost ASC")
    List<Place> findByTripOrderByCostAsc(@Param("trip") Trip trip);
    
    // Longest duration places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.duration DESC")
    List<Place> findByTripOrderByDurationDesc(@Param("trip") Trip trip);
    
    // Shortest duration places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.duration ASC")
    List<Place> findByTripOrderByDurationAsc(@Param("trip") Trip trip);
    
    // Recently added places
    @Query("SELECT p FROM Place p WHERE p.trip = :trip ORDER BY p.createdAt DESC")
    List<Place> findByTripOrderByCreatedAtDesc(@Param("trip") Trip trip);
    
    // General search methods (for controllers)
    @Query("SELECT p FROM Place p WHERE p.name LIKE %:name% OR p.location LIKE %:location% OR p.description LIKE %:description%")
    List<Place> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrDescriptionContainingIgnoreCase(@Param("name") String name, @Param("location") String location, @Param("description") String description);
    
    List<Place> findByCategory(Place.PlaceCategory category);
    
    List<Place> findByRatingGreaterThanEqual(Integer rating);
    
    // Statistics
    @Query("SELECT AVG(p.rating) FROM Place p WHERE p.trip = :trip")
    Optional<Double> findAverageRatingByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT AVG(p.cost) FROM Place p WHERE p.trip = :trip")
    Optional<BigDecimal> findAverageCostByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT SUM(p.cost) FROM Place p WHERE p.trip = :trip")
    Optional<BigDecimal> findTotalCostByTrip(@Param("trip") Trip trip);
    
    @Query("SELECT COUNT(p) FROM Place p WHERE p.trip = :trip AND p.category = :category")
    long countByTripAndCategory(@Param("trip") Trip trip, @Param("category") Place.PlaceCategory category);
    
    @Query("SELECT p.category, COUNT(p) FROM Place p WHERE p.trip = :trip GROUP BY p.category")
    List<Object[]> findCategoryCountsByTrip(@Param("trip") Trip trip);
    
    // Find places by multiple categories
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.category IN :categories")
    List<Place> findByTripAndCategoryIn(@Param("trip") Trip trip, @Param("categories") List<Place.PlaceCategory> categories);
    
    // Find places with valid coordinates
    @Query("SELECT p FROM Place p WHERE p.trip = :trip AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL")
    List<Place> findByTripAndHasValidCoordinates(@Param("trip") Trip trip);
}
