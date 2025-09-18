package com.example.tripplanner.controller;

import com.example.tripplanner.model.Place;
import com.example.tripplanner.model.Trip;
import com.example.tripplanner.repository.PlaceRepository;
import com.example.tripplanner.repository.TripRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/trips")
@Tag(name = "Trip Places Management", description = "APIs for managing places within trips")
public class TripPlacesController {

    @Autowired
    private PlaceRepository placeRepository;
    
    @Autowired
    private TripRepository tripRepository;

    // REMOVED: This endpoint conflicts with TripController.getPlacesByTripId
    // The new TripController handles place retrieval with PlaceDTO and proper service layer
    // Use GET /trips/{tripId}/places with PlaceDTO instead

    // REMOVED: This endpoint conflicts with TripController.addPlaceToTrip
    // The new TripController handles place creation with PlaceDTO and proper service layer
    // Use POST /trips/{tripId}/places with PlaceDTO instead

    // REMOVED: This endpoint conflicts with TripController.removePlaceFromTrip
    // The new TripController handles place deletion with proper service layer
    // Use DELETE /trips/{tripId}/places/{placeId} instead

    @PutMapping("/{tripId}/places/{placeId}")
    @Operation(summary = "Update a place in a specific trip", description = "Update details of a place that belongs to a specific trip")
    public ResponseEntity<Place> updatePlaceInTrip(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "ID of the place to update") 
            @PathVariable Long placeId,
            @Parameter(description = "Updated place object") 
            @RequestBody Place updatedPlace) {
        
        System.out.println("📝 Updating place " + placeId + " in trip: " + tripId);
        
        Optional<Trip> trip = tripRepository.findById(tripId);
        if (!trip.isPresent()) {
            System.out.println("❌ Trip not found: " + tripId);
            return ResponseEntity.notFound().build();
        }
        
        Optional<Place> existingPlace = placeRepository.findById(placeId);
        if (!existingPlace.isPresent()) {
            System.out.println("❌ Place not found: " + placeId);
            return ResponseEntity.notFound().build();
        }
        
        // Verify the place belongs to this trip
        if (!existingPlace.get().getTrip().getId().equals(tripId)) {
            System.out.println("❌ Place " + placeId + " does not belong to trip " + tripId);
            return ResponseEntity.badRequest().build();
        }
        
        // Update the place details
        Place place = existingPlace.get();
        place.setName(updatedPlace.getName());
        place.setLocation(updatedPlace.getLocation());
        place.setDescription(updatedPlace.getDescription());
        place.setCategory(updatedPlace.getCategory());
        place.setRating(updatedPlace.getRating());
        place.setPhotos(updatedPlace.getPhotos());
        place.setLatitude(updatedPlace.getLatitude());
        place.setLongitude(updatedPlace.getLongitude());
        place.setCost(updatedPlace.getCost());
        place.setDuration(updatedPlace.getDuration());
        
        Place savedPlace = placeRepository.save(place);
        System.out.println("✅ Place " + placeId + " updated in trip " + tripId);
        
        return ResponseEntity.ok(savedPlace);
    }
}
