package com.example.tripplanner.controller;

import com.example.tripplanner.dto.TripDTO;
import com.example.tripplanner.dto.PlaceDTO;
import com.example.tripplanner.dto.ExpenseDTO;
import com.example.tripplanner.dto.ActivityDTO;
import com.example.tripplanner.dto.ItineraryDTO;
import com.example.tripplanner.dto.TripPlanDTO;
import com.example.tripplanner.dto.PagedResponseDTO;
import com.example.tripplanner.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/trips")
@Tag(name = "Trip Management", description = "APIs for managing trips")
@CrossOrigin(origins = "*")
public class TripController {

    @Autowired
    private TripService tripService;

    // Trip CRUD Operations
    @GetMapping
    @Operation(summary = "Get all trips", description = "Retrieve a list of all trips")
    public ResponseEntity<List<TripDTO>> getAllTrips() {
        List<TripDTO> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get trip by ID", description = "Retrieve a specific trip by its ID")
    public ResponseEntity<TripDTO> getTripById(
            @Parameter(description = "ID of the trip to retrieve")
            @PathVariable Long id) {
        Optional<TripDTO> trip = tripService.getTripById(id);
        return trip.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new trip", description = "Create a new trip with the provided details")
    public ResponseEntity<TripDTO> createTrip(
            @Parameter(description = "Trip object to create")
            @Valid @RequestBody TripDTO tripDTO,
            @RequestParam(required = false) String firebaseUid) {
        try {
            System.out.println("=== TRIP CREATION REQUEST ===");
            System.out.println("Trip DTO: " + tripDTO);
            System.out.println("Firebase UID: " + firebaseUid);
            
            TripDTO createdTrip = tripService.createTrip(tripDTO, firebaseUid);
            System.out.println("✅ Trip created successfully with ID: " + createdTrip.getId());
            return ResponseEntity.ok(createdTrip);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING TRIP ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a trip", description = "Update an existing trip by its ID")
    public ResponseEntity<?> updateTrip(
            @Parameter(description = "ID of the trip to update")
            @PathVariable Long id,
            @Parameter(description = "Updated trip object")
            @Valid @RequestBody TripDTO tripDetails) {
        try {
            System.out.println("=== TRIP UPDATE DEBUG ===");
            System.out.println("Updating trip with ID: " + id);
            System.out.println("Received trip details: " + tripDetails);

            TripDTO updatedTrip = tripService.updateTrip(id, tripDetails);
            System.out.println("✅ Successfully updated trip with ID: " + updatedTrip.getId());
            return ResponseEntity.ok(updatedTrip);
        } catch (Exception e) {
            System.err.println("=== ERROR UPDATING TRIP ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating trip: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trip", description = "Delete a trip by its ID")
    public ResponseEntity<Void> deleteTrip(
            @Parameter(description = "ID of the trip to delete")
            @PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }

    // Trip Places Operations
    @GetMapping("/{id}/places")
    @Operation(summary = "Get places for a trip", description = "Retrieve all places associated with a trip")
    public ResponseEntity<List<PlaceDTO>> getPlacesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id) {
        List<PlaceDTO> places = tripService.getPlacesByTripId(id);
        return ResponseEntity.ok(places);
    }

    @PostMapping("/{id}/places")
    @Operation(summary = "Add place to trip", description = "Add a new place to a specific trip")
    public ResponseEntity<PlaceDTO> addPlaceToTrip(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id,
            @Parameter(description = "Place object to add")
            @Valid @RequestBody PlaceDTO placeDTO) {
        try {
            System.out.println("=== ADDING PLACE TO TRIP ===");
            System.out.println("Trip ID: " + id);
            System.out.println("Place DTO: " + placeDTO);
            
            PlaceDTO createdPlace = tripService.addPlaceToTrip(id, placeDTO);
            System.out.println("✅ Place added successfully with ID: " + createdPlace.getId());
            return ResponseEntity.ok(createdPlace);
        } catch (Exception e) {
            System.err.println("=== ERROR ADDING PLACE ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}/places/{placeId}")
    @Operation(summary = "Remove place from trip", description = "Remove a place from a specific trip")
    public ResponseEntity<Void> removePlaceFromTrip(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id,
            @Parameter(description = "ID of the place to remove")
            @PathVariable Long placeId) {
        tripService.removePlaceFromTrip(id, placeId);
        return ResponseEntity.noContent().build();
    }

    // Trip Expenses Operations
    @GetMapping("/{id}/expenses")
    @Operation(summary = "Get expenses for a trip", description = "Retrieve all expenses associated with a trip")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id) {
        List<ExpenseDTO> expenses = tripService.getExpensesByTripId(id);
        return ResponseEntity.ok(expenses);
    }

    // Trip Activities Operations
    @GetMapping("/{id}/activities")
    @Operation(summary = "Get activities for a trip", description = "Retrieve all activities associated with a trip")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id) {
        List<ActivityDTO> activities = tripService.getActivitiesByTripId(id);
        return ResponseEntity.ok(activities);
    }

    // Trip Itinerary Operations
    @GetMapping("/{id}/itinerary")
    @Operation(summary = "Get itinerary for a trip", description = "Retrieve all itinerary days for a trip")
    public ResponseEntity<List<ItineraryDTO>> getItineraryByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id) {
        List<ItineraryDTO> itineraries = tripService.getItinerariesByTripId(id);
        return ResponseEntity.ok(itineraries);
    }

    // Additional endpoints matching frontend expectations
    @GetMapping("/search")
    @Operation(summary = "Search trips", description = "Search trips by query")
    public ResponseEntity<List<TripDTO>> searchTrips(
            @Parameter(description = "Search query")
            @RequestParam String query) {
        // TODO: Implement search functionality
        List<TripDTO> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get trips by status", description = "Retrieve trips filtered by status")
    public ResponseEntity<List<TripDTO>> getTripsByStatus(
            @Parameter(description = "Trip status")
            @PathVariable String status) {
        // TODO: Implement status filtering
        List<TripDTO> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/user/{firebaseUid}/upcoming")
    @Operation(summary = "Get upcoming trips for user", description = "Retrieve upcoming trips for a specific user")
    public ResponseEntity<PagedResponseDTO<TripDTO>> getUpcomingTripsByUser(
            @Parameter(description = "Firebase UID of the user")
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size) {
        try {
            System.out.println("=== GETTING UPCOMING TRIPS FOR USER ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Page: " + page + ", Size: " + size);
            
            PagedResponseDTO<TripDTO> trips = tripService.getUpcomingTripsByUser(firebaseUid, page, size);
            System.out.println("✅ Returning " + trips.getContent().size() + " upcoming trips");
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING UPCOMING TRIPS ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new PagedResponseDTO<>(new ArrayList<>(), 0, size, 0));
        }
    }

    @GetMapping("/user/{firebaseUid}")
    @Operation(summary = "Get all trips for user", description = "Retrieve all trips for a specific user")
    public ResponseEntity<PagedResponseDTO<TripDTO>> getAllTripsByUser(
            @Parameter(description = "Firebase UID of the user")
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println("=== GETTING ALL TRIPS FOR USER ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Page: " + page + ", Size: " + size);
            
            PagedResponseDTO<TripDTO> trips = tripService.getAllTripsByUser(firebaseUid, page, size);
            System.out.println("✅ Returning " + trips.getContent().size() + " total trips");
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING ALL TRIPS ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new PagedResponseDTO<>(new ArrayList<>(), 0, size, 0));
        }
    }

    @GetMapping("/user/{firebaseUid}/accessible")
    @Operation(summary = "Get accessible trips for user", description = "Retrieve trips accessible to user (own trips + shared trips)")
    public ResponseEntity<PagedResponseDTO<TripDTO>> getAccessibleTripsByUser(
            @Parameter(description = "Firebase UID of the user")
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println("=== GETTING ACCESSIBLE TRIPS FOR USER ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Page: " + page + ", Size: " + size);
            
            PagedResponseDTO<TripDTO> trips = tripService.getAccessibleTripsByUser(firebaseUid, page, size);
            System.out.println("✅ Returning " + trips.getContent().size() + " accessible trips");
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING ACCESSIBLE TRIPS ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new PagedResponseDTO<>(new ArrayList<>(), 0, size, 0));
        }
    }

    @GetMapping("/user/{firebaseUid}/accessible/upcoming")
    @Operation(summary = "Get upcoming accessible trips for user", description = "Retrieve upcoming trips accessible to user (own trips + shared trips)")
    public ResponseEntity<PagedResponseDTO<TripDTO>> getUpcomingAccessibleTripsByUser(
            @Parameter(description = "Firebase UID of the user")
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println("=== GETTING UPCOMING ACCESSIBLE TRIPS FOR USER ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Page: " + page + ", Size: " + size);
            
            PagedResponseDTO<TripDTO> trips = tripService.getUpcomingAccessibleTripsByUser(firebaseUid, page, size);
            System.out.println("✅ Returning " + trips.getContent().size() + " upcoming accessible trips");
            return ResponseEntity.ok(trips);
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING UPCOMING ACCESSIBLE TRIPS ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new PagedResponseDTO<>(new ArrayList<>(), 0, size, 0));
        }
    }

    // Unified Trip Plan Operations
    @PostMapping("/{id}/plan")
    @Operation(summary = "Save complete trip plan", description = "Save the entire trip plan including places, activities, and expenses in one operation")
    public ResponseEntity<TripPlanDTO> saveTripPlan(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id,
            @Parameter(description = "Complete trip plan data")
            @Valid @RequestBody TripPlanDTO tripPlanDTO) {
        try {
            System.out.println("=== SAVING COMPLETE TRIP PLAN ===");
            System.out.println("Trip ID: " + id);
            System.out.println("Trip Plan DTO: " + tripPlanDTO);
            
            TripPlanDTO savedPlan = tripService.saveTripPlan(id, tripPlanDTO);
            System.out.println("✅ Trip plan saved successfully");
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            System.err.println("=== ERROR SAVING TRIP PLAN ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}/plan")
    @Operation(summary = "Get complete trip plan", description = "Retrieve the complete trip plan including places, activities, and expenses")
    public ResponseEntity<TripPlanDTO> getTripPlan(
            @Parameter(description = "ID of the trip")
            @PathVariable Long id) {
        try {
            System.out.println("=== GETTING COMPLETE TRIP PLAN ===");
            System.out.println("Trip ID: " + id);
            
            TripPlanDTO tripPlan = tripService.getTripPlan(id);
            System.out.println("✅ Trip plan retrieved successfully");
            return ResponseEntity.ok(tripPlan);
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING TRIP PLAN ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }
}