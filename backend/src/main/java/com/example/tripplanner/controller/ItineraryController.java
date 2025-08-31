package com.example.tripplanner.controller;

import com.example.tripplanner.model.Itinerary;
import com.example.tripplanner.repository.ItineraryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/itineraries")
@Tag(name = "Itinerary Management", description = "APIs for managing trip itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get itineraries by trip ID", description = "Retrieve all itineraries for a specific trip")
    public ResponseEntity<List<Itinerary>> getItinerariesByTripId(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId) {
        List<Itinerary> itineraries = itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId);
        return ResponseEntity.ok(itineraries);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get itinerary by ID", description = "Retrieve a specific itinerary by its ID")
    public ResponseEntity<Itinerary> getItineraryById(
            @Parameter(description = "ID of the itinerary to retrieve") 
            @PathVariable Long id) {
        Optional<Itinerary> itinerary = itineraryRepository.findById(id);
        return itinerary.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new itinerary", description = "Create a new itinerary for a trip")
    public ResponseEntity<Itinerary> createItinerary(
            @Parameter(description = "Itinerary object to create") 
            @RequestBody Itinerary itinerary) {
        Itinerary savedItinerary = itineraryRepository.save(itinerary);
        return ResponseEntity.ok(savedItinerary);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an itinerary", description = "Update an existing itinerary by its ID")
    public ResponseEntity<Itinerary> updateItinerary(
            @Parameter(description = "ID of the itinerary to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated itinerary object") 
            @RequestBody Itinerary itineraryDetails) {
        Optional<Itinerary> existingItinerary = itineraryRepository.findById(id);
        if (existingItinerary.isPresent()) {
            Itinerary itinerary = existingItinerary.get();
            itinerary.setDayNumber(itineraryDetails.getDayNumber());
            itinerary.setDate(itineraryDetails.getDate());
            itinerary.setNotes(itineraryDetails.getNotes());
            
            Itinerary updatedItinerary = itineraryRepository.save(itinerary);
            return ResponseEntity.ok(updatedItinerary);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an itinerary", description = "Delete an itinerary by its ID")
    public ResponseEntity<Void> deleteItinerary(
            @Parameter(description = "ID of the itinerary to delete") 
            @PathVariable Long id) {
        if (itineraryRepository.existsById(id)) {
            itineraryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
