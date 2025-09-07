package com.example.tripplanner.controller;

import com.example.tripplanner.model.Expense;
import com.example.tripplanner.model.Place;
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
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/trips")
@Tag(name = "Trip Management", description = "APIs for managing trips")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TripController {

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    @Operation(summary = "Get all trips", description = "Retrieve a list of all trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        System.out.println("📋 GET /trips request received");
        List<Trip> trips = tripRepository.findAll();
        System.out.println("✅ Returning " + trips.size() + " trips");
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Simple health check endpoint")
    public ResponseEntity<Map<String, String>> healthCheck() {
        System.out.println("🏥 Health check request received");
        return ResponseEntity.ok(Map.of("status", "healthy", "message", "Backend is running"));
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
            System.out.println("Creating trip with data: " + trip);
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Trip title: " + trip.getTitle());
            System.out.println("Trip destination: " + trip.getDestination());
            System.out.println("Trip start date: " + trip.getStartDate());
            System.out.println("Trip end date: " + trip.getEndDate());
            System.out.println("Trip budget: " + trip.getBudget());
            
            // Find user by Firebase UID
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            User user;
            if (userOpt.isEmpty()) {
                System.out.println("User not found with Firebase UID: " + firebaseUid + ", creating new user...");
                // Create a new user with the Firebase UID
                user = new User();
                user.setFirebaseUid(firebaseUid);
                user.setEmail("user+" + firebaseUid + "@example.com"); // Temporary email
                user.setDisplayName("User " + firebaseUid.substring(0, Math.min(8, firebaseUid.length())));
                user.setEmailVerified(false);
                user.setActive(true);
                user.setRole(User.UserRole.USER);
                
                user = userRepository.save(user);
                System.out.println("✅ Created new user with ID: " + user.getId());
            } else {
                user = userOpt.get();
                System.out.println("Found existing user: " + user.getId());
            }
            
            // Validate required fields
            if (trip.getTitle() == null || trip.getTitle().trim().isEmpty()) {
                System.err.println("Validation failed: Title is required");
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (trip.getDestination() == null || trip.getDestination().trim().isEmpty()) {
                System.err.println("Validation failed: Destination is required");
                return ResponseEntity.badRequest().body("Destination is required");
            }
            if (trip.getStartDate() == null) {
                System.err.println("Validation failed: Start date is required");
                return ResponseEntity.badRequest().body("Start date is required");
            }
            if (trip.getEndDate() == null) {
                System.err.println("Validation failed: End date is required");
                return ResponseEntity.badRequest().body("End date is required");
            }
            if (trip.getBudget() == null) {
                System.err.println("Validation failed: Budget is required");
                return ResponseEntity.badRequest().body("Budget is required");
            }
            
            System.out.println("✅ All validations passed");
            
            // Set the user for the trip
            trip.setUser(user);
            
            // Handle places if they exist in the trip data
            if (trip.getPlaces() != null && !trip.getPlaces().isEmpty()) {
                System.out.println("Processing " + trip.getPlaces().size() + " places");
                for (Place place : trip.getPlaces()) {
                    place.setTrip(trip);
                }
            }
            
            // Handle expenses if they exist in the trip data
            if (trip.getExpenses() != null && !trip.getExpenses().isEmpty()) {
                System.out.println("Processing " + trip.getExpenses().size() + " expenses");
                for (Expense expense : trip.getExpenses()) {
                    expense.setTrip(trip);
                }
            }
            
            // Handle itinerary data - convert to JSON string
            if (trip.getItineraryData() != null && !trip.getItineraryData().trim().isEmpty()) {
                System.out.println("Processing itinerary data: " + trip.getItineraryData());
                // The itinerary data is already a JSON string from the frontend
                // No additional processing needed
            } else {
                System.out.println("No itinerary data provided");
                trip.setItineraryData("{}"); // Set empty JSON object
            }
            
            System.out.println("Saving trip to database...");
            Trip savedTrip = tripRepository.save(trip);
            System.out.println("✅ Trip saved successfully with ID: " + savedTrip.getId());
            return ResponseEntity.ok(savedTrip);
        } catch (Exception e) {
            System.err.println("Error creating trip: " + e.getMessage());
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
            
            // Handle places update
            if (tripDetails.getPlaces() != null) {
                System.out.println("Updating places for trip ID: " + id);
                // Clear existing places and add new ones
                trip.getPlaces().clear();
                for (Place place : tripDetails.getPlaces()) {
                    place.setTrip(trip);
                    trip.getPlaces().add(place);
                }
            }
            
            // Handle expenses update
            if (tripDetails.getExpenses() != null) {
                System.out.println("Updating expenses for trip ID: " + id);
                // Clear existing expenses and add new ones
                trip.getExpenses().clear();
                for (Expense expense : tripDetails.getExpenses()) {
                    expense.setTrip(trip);
                    trip.getExpenses().add(expense);
                }
            }
            
            // Handle itinerary data update
            if (tripDetails.getItineraryData() != null) {
                System.out.println("Updating itinerary data for trip ID: " + id);
                trip.setItineraryData(tripDetails.getItineraryData());
            }
            
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
        System.out.println("🗑️ DELETE request received for trip ID: " + id);
        try {
            if (tripRepository.existsById(id)) {
                System.out.println("✅ Trip exists, deleting...");
                tripRepository.deleteById(id);
                System.out.println("✅ Trip deleted successfully");
                return ResponseEntity.noContent().build();
            } else {
                System.out.println("❌ Trip not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error deleting trip: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
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
        User user;
        if (userOpt.isEmpty()) {
            System.out.println("User not found with Firebase UID: " + firebaseUid + ", creating new user...");
            // Create a new user with the Firebase UID
            user = new User();
            user.setFirebaseUid(firebaseUid);
            user.setEmail("user+" + firebaseUid + "@example.com"); // Temporary email
            user.setDisplayName("User " + firebaseUid.substring(0, Math.min(8, firebaseUid.length())));
            user.setEmailVerified(false);
            user.setActive(true);
            user.setRole(User.UserRole.USER);
            
            user = userRepository.save(user);
            System.out.println("✅ Created new user with ID: " + user.getId());
        } else {
            user = userOpt.get();
        }
        
        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(page, size);
        
        // Get upcoming trips for the user (trips that start today or later)
        Page<Trip> tripPage = tripRepository.findByUserAndStartDateGreaterThanEqual(user, today, pageable);
        
        return ResponseEntity.ok(tripPage);
    }
    
    @GetMapping("/user/{firebaseUid}/all")
    @Operation(summary = "Get all trips for a user", description = "Retrieve all trips for a specific user with paging support")
    public ResponseEntity<?> getAllTripsByUser(
            @PathVariable String firebaseUid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        User user;
        if (userOpt.isEmpty()) {
            System.out.println("User not found with Firebase UID: " + firebaseUid + ", creating new user...");
            // Create a new user with the Firebase UID
            user = new User();
            user.setFirebaseUid(firebaseUid);
            user.setEmail("user+" + firebaseUid + "@example.com"); // Temporary email
            user.setDisplayName("User " + firebaseUid.substring(0, Math.min(8, firebaseUid.length())));
            user.setEmailVerified(false);
            user.setActive(true);
            user.setRole(User.UserRole.USER);
            
            user = userRepository.save(user);
            System.out.println("✅ Created new user with ID: " + user.getId());
        } else {
            user = userOpt.get();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        
        // Get all trips for the user
        Page<Trip> tripPage = tripRepository.findByUserOrderByStartDateDesc(user, pageable);
        
        return ResponseEntity.ok(tripPage);
    }
    
    @GetMapping("/test/user/{firebaseUid}")
    @Operation(summary = "Test user lookup", description = "Test endpoint to check if a user exists")
    public ResponseEntity<?> testUserLookup(@PathVariable String firebaseUid) {
        System.out.println("Testing user lookup for Firebase UID: " + firebaseUid);
        
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            System.out.println("❌ User not found with Firebase UID: " + firebaseUid);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User not found with Firebase UID: " + firebaseUid,
                "firebaseUid", firebaseUid
            ));
        }
        
        User user = userOpt.get();
        System.out.println("✅ User found: " + user.getId() + " - " + user.getEmail());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User found",
            "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "displayName", user.getDisplayName(),
                "firebaseUid", user.getFirebaseUid()
            )
        ));
    }
}
