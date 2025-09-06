package com.example.tripplanner.controller;

import com.example.tripplanner.model.Place;
import com.example.tripplanner.model.Trip;
import com.example.tripplanner.repository.PlaceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/places")
@Tag(name = "Place Management", description = "APIs for managing places")
public class PlaceController {

    @Autowired
    private PlaceRepository placeRepository;

    @GetMapping
    @Operation(summary = "Get all places", description = "Retrieve a list of all places")
    public ResponseEntity<List<Place>> getAllPlaces() {
        List<Place> places = placeRepository.findAll();
        return ResponseEntity.ok(places);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get place by ID", description = "Retrieve a specific place by its ID")
    public ResponseEntity<Place> getPlaceById(
            @Parameter(description = "ID of the place to retrieve") 
            @PathVariable Long id) {
        Optional<Place> place = placeRepository.findById(id);
        return place.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new place", description = "Create a new place with the provided details")
    public ResponseEntity<Place> createPlace(
            @Parameter(description = "Place object to create") 
            @RequestBody Place place) {
        Place savedPlace = placeRepository.save(place);
        return ResponseEntity.ok(savedPlace);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a place", description = "Update an existing place by its ID")
    public ResponseEntity<Place> updatePlace(
            @Parameter(description = "ID of the place to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated place object") 
            @RequestBody Place placeDetails) {
        Optional<Place> existingPlace = placeRepository.findById(id);
        if (existingPlace.isPresent()) {
            Place place = existingPlace.get();
            place.setName(placeDetails.getName());
            place.setLocation(placeDetails.getLocation());
            place.setDescription(placeDetails.getDescription());
            place.setCategory(placeDetails.getCategory());
            place.setRating(placeDetails.getRating());
            place.setCost(placeDetails.getCost());
            place.setDuration(placeDetails.getDuration());
            place.setLatitude(placeDetails.getLatitude());
            place.setLongitude(placeDetails.getLongitude());
            place.setPhotos(placeDetails.getPhotos());
            
            Place updatedPlace = placeRepository.save(place);
            return ResponseEntity.ok(updatedPlace);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a place", description = "Delete a place by its ID")
    public ResponseEntity<Void> deletePlace(
            @Parameter(description = "ID of the place to delete") 
            @PathVariable Long id) {
        if (placeRepository.existsById(id)) {
            placeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search places", description = "Search places by name, location, or description")
    public ResponseEntity<List<Place>> searchPlaces(
            @Parameter(description = "Search term for name, location, or description") 
            @RequestParam String query) {
        List<Place> places = placeRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, query);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get places by category", description = "Retrieve places filtered by category")
    public ResponseEntity<List<Place>> getPlacesByCategory(
            @Parameter(description = "Category to filter by") 
            @PathVariable Place.PlaceCategory category) {
        List<Place> places = placeRepository.findByCategory(category);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/rating/{minRating}")
    @Operation(summary = "Get places by minimum rating", description = "Retrieve places with rating greater than or equal to the specified value")
    public ResponseEntity<List<Place>> getPlacesByMinRating(
            @Parameter(description = "Minimum rating value") 
            @PathVariable Integer minRating) {
        List<Place> places = placeRepository.findByRatingGreaterThanEqual(minRating);
        return ResponseEntity.ok(places);
    }

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get places by trip ID", description = "Retrieve all places associated with a specific trip")
    public ResponseEntity<List<Place>> getPlacesByTripId(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId) {
        // We need to create a Trip object with just the ID to use the repository method
        Trip trip = new Trip();
        trip.setId(tripId);
        List<Place> places = placeRepository.findByTrip(trip);
        return ResponseEntity.ok(places);
    }
}
