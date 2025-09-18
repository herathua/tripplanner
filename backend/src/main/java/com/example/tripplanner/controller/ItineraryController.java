package com.example.tripplanner.controller;

import com.example.tripplanner.dto.ItineraryDTO;
import com.example.tripplanner.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/itineraries")
@Tag(name = "Itinerary Management", description = "APIs for managing itineraries")
@CrossOrigin(origins = "*")
public class ItineraryController {

    @Autowired
    private TripService tripService;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get itineraries by trip ID", description = "Retrieve all itinerary days for a specific trip")
    public ResponseEntity<List<ItineraryDTO>> getItinerariesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId) {
        List<ItineraryDTO> itineraries = tripService.getItinerariesByTripId(tripId);
        return ResponseEntity.ok(itineraries);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get itinerary by ID", description = "Retrieve a specific itinerary by its ID")
    public ResponseEntity<ItineraryDTO> getItineraryById(
            @Parameter(description = "ID of the itinerary to retrieve")
            @PathVariable Long id) {
        // TODO: Implement get itinerary by ID
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create a new itinerary", description = "Create a new itinerary day")
    public ResponseEntity<ItineraryDTO> createItinerary(
            @Parameter(description = "Itinerary object to create")
            @Valid @RequestBody ItineraryDTO itineraryDTO) {
        try {
            System.out.println("=== CREATING ITINERARY ===");
            System.out.println("Itinerary DTO: " + itineraryDTO);
            
            ItineraryDTO createdItinerary = tripService.createItinerary(itineraryDTO);
            System.out.println("✅ Itinerary created successfully with ID: " + createdItinerary.getId());
            return ResponseEntity.ok(createdItinerary);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING ITINERARY ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update itinerary", description = "Update an existing itinerary")
    public ResponseEntity<ItineraryDTO> updateItinerary(
            @Parameter(description = "ID of the itinerary to update")
            @PathVariable Long id,
            @Parameter(description = "Updated itinerary object")
            @Valid @RequestBody ItineraryDTO itineraryDTO) {
        // TODO: Implement update itinerary
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete itinerary", description = "Delete an itinerary by its ID")
    public ResponseEntity<Void> deleteItinerary(
            @Parameter(description = "ID of the itinerary to delete")
            @PathVariable Long id) {
        // TODO: Implement delete itinerary
        return ResponseEntity.notFound().build();
    }
}