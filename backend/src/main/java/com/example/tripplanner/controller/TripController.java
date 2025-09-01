package com.example.tripplanner.controller;

import com.example.tripplanner.model.Trip;
import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.TripRepository;
import com.example.tripplanner.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/trips")
@Tag(name = "Trip Management", description = "APIs for managing trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all trips", description = "Retrieve a list of all trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get trip by ID", description = "Retrieve a specific trip by its ID")
    public ResponseEntity<Trip> getTripById(
            @Parameter(description = "ID of the trip to retrieve") 
            @PathVariable Long id) {
        Optional<Trip> trip = tripRepository.findById(id);
        return trip.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new trip", description = "Create a new trip with the provided details")
    public ResponseEntity<?> createTrip(
            @Parameter(description = "Trip object to create") 
            @RequestBody Trip trip,
            @RequestParam String firebaseUid) {
        try {
            System.out.println("=== TRIP CREATION DEBUG ===");
            System.out.println("Received trip object: " + trip);
            System.out.println("Trip title: " + (trip.getTitle() != null ? trip.getTitle() : "NULL"));
            System.out.println("Trip destination: " + (trip.getDestination() != null ? trip.getDestination() : "NULL"));
            System.out.println("Trip startDate: " + (trip.getStartDate() != null ? trip.getStartDate().toString() : "NULL"));
            System.out.println("Trip endDate: " + (trip.getEndDate() != null ? trip.getEndDate().toString() : "NULL"));
            System.out.println("Trip budget: " + (trip.getBudget() != null ? trip.getBudget().toString() : "NULL"));
            System.out.println("Trip status: " + (trip.getStatus() != null ? trip.getStatus().toString() : "NULL"));
            System.out.println("Trip visibility: " + (trip.getVisibility() != null ? trip.getVisibility().toString() : "NULL"));
            System.out.println("Firebase UID: " + firebaseUid);
            
            // Find user by Firebase UID
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                System.out.println("ERROR: User not found with Firebase UID: " + firebaseUid);
                return ResponseEntity.badRequest().body("User not found with Firebase UID: " + firebaseUid);
            }
            User user = userOpt.get();
            System.out.println("Found user: " + user.getDisplayName() + " (ID: " + user.getId() + ")");
            
            // Validate required fields
            if (trip.getTitle() == null || trip.getTitle().trim().isEmpty()) {
                System.out.println("ERROR: Title is null or empty");
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (trip.getDestination() == null || trip.getDestination().trim().isEmpty()) {
                System.out.println("ERROR: Destination is null or empty");
                return ResponseEntity.badRequest().body("Destination is required");
            }
            if (trip.getStartDate() == null) {
                System.out.println("ERROR: Start date is null");
                return ResponseEntity.badRequest().body("Start date is required");
            }
            if (trip.getEndDate() == null) {
                System.out.println("ERROR: End date is null");
                return ResponseEntity.badRequest().body("End date is required");
            }
            if (trip.getBudget() == null) {
                System.out.println("ERROR: Budget is null");
                return ResponseEntity.badRequest().body("Budget is required");
            }
            
            System.out.println("All validations passed, saving trip...");
            
            // Set the user for the trip
            trip.setUser(user);
            
            Trip savedTrip = tripRepository.save(trip);
            System.out.println("Successfully saved trip with ID: " + savedTrip.getId());
            return ResponseEntity.ok(savedTrip);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING TRIP ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating trip: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a trip", description = "Update an existing trip by its ID")
    public ResponseEntity<Trip> updateTrip(
            @Parameter(description = "ID of the trip to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated trip object") 
            @RequestBody Trip tripDetails) {
        Optional<Trip> existingTrip = tripRepository.findById(id);
        if (existingTrip.isPresent()) {
            Trip trip = existingTrip.get();
            trip.setTitle(tripDetails.getTitle());
            trip.setDestination(tripDetails.getDestination());
            trip.setStartDate(tripDetails.getStartDate());
            trip.setEndDate(tripDetails.getEndDate());
            trip.setBudget(tripDetails.getBudget());
            trip.setDescription(tripDetails.getDescription());
            trip.setStatus(tripDetails.getStatus());
            trip.setVisibility(tripDetails.getVisibility());
            
            Trip updatedTrip = tripRepository.save(trip);
            return ResponseEntity.ok(updatedTrip);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a trip", description = "Delete a trip by its ID")
    public ResponseEntity<Void> deleteTrip(
            @Parameter(description = "ID of the trip to delete") 
            @PathVariable Long id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search trips", description = "Search trips by destination or title")
    public ResponseEntity<List<Trip>> searchTrips(
            @Parameter(description = "Search term for destination or title") 
            @RequestParam String query) {
        List<Trip> trips = tripRepository.findByDestinationContainingIgnoreCaseOrTitleContainingIgnoreCase(query, query);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get trips by status", description = "Retrieve trips filtered by status")
    public ResponseEntity<List<Trip>> getTripsByStatus(
            @Parameter(description = "Status to filter by") 
            @PathVariable Trip.TripStatus status) {
        List<Trip> trips = tripRepository.findByStatus(status);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/user/{firebaseUid}/upcoming")
    @Operation(summary = "Get upcoming trips for a user", description = "Retrieve upcoming trips for a specific user with paging support")
    public ResponseEntity<?> getUpcomingTripsByUser(
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size) {
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found with Firebase UID: " + firebaseUid);
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(page, size);
        Page<Trip> tripPage = tripRepository.findByUserAndStartDateAfter(user, today.minusDays(1), pageable);
        return ResponseEntity.ok(tripPage);
    }
}
