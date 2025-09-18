package com.example.tripplanner.controller;

import com.example.tripplanner.dto.ActivityDTO;
import com.example.tripplanner.model.Activity;
import com.example.tripplanner.repository.ActivityRepository;
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

@RestController
@RequestMapping("/activities")
@Tag(name = "Activity Management", description = "APIs for managing activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private TripService tripService;
    
    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get activities by trip ID", description = "Retrieve all activities for a specific trip")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTripId(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId) {
        List<ActivityDTO> activities = tripService.getActivitiesByTripId(tripId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/itinerary/{itineraryId}")
    @Operation(summary = "Get activities by itinerary ID", description = "Retrieve all activities for a specific itinerary")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByItineraryId(
            @Parameter(description = "ID of the itinerary")
            @PathVariable Long itineraryId) {
        // TODO: Implement get activities by itinerary ID
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity by ID", description = "Retrieve a specific activity by its ID")
    public ResponseEntity<ActivityDTO> getActivityById(
            @Parameter(description = "ID of the activity to retrieve")
            @PathVariable Long id) {
        try {
            System.out.println("=== GETTING ACTIVITY BY ID ===");
            System.out.println("Activity ID: " + id);
            
            // Find activity by ID
            Optional<Activity> activity = activityRepository.findById(id);
            if (activity.isPresent()) {
                ActivityDTO activityDTO = convertToActivityDTO(activity.get());
                System.out.println("✅ Found activity: " + activityDTO.getName());
                return ResponseEntity.ok(activityDTO);
            } else {
                System.out.println("❌ Activity not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR GETTING ACTIVITY ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    @Operation(summary = "Create a new activity", description = "Create a new activity")
    public ResponseEntity<ActivityDTO> createActivity(
            @Parameter(description = "Activity object to create")
            @Valid @RequestBody ActivityDTO activityDTO) {
        try {
            System.out.println("=== CREATING ACTIVITY ===");
            System.out.println("Activity DTO: " + activityDTO);
            System.out.println("Activity DTO Details:");
            System.out.println("  - Name: " + activityDTO.getName());
            System.out.println("  - Description: " + activityDTO.getDescription());
            System.out.println("  - Start Time: " + activityDTO.getStartTime());
            System.out.println("  - End Time: " + activityDTO.getEndTime());
            System.out.println("  - Cost: " + activityDTO.getCost());
            System.out.println("  - Duration: " + activityDTO.getDurationHours());
            System.out.println("  - Type: " + activityDTO.getType());
            System.out.println("  - Status: " + activityDTO.getStatus());
            System.out.println("  - Trip ID: " + activityDTO.getTripId());
            System.out.println("  - Itinerary ID: " + activityDTO.getItineraryId());
            System.out.println("  - Place ID: " + activityDTO.getPlaceId());
            
            ActivityDTO createdActivity = tripService.createActivity(activityDTO);
            System.out.println("✅ Activity created successfully with ID: " + createdActivity.getId());
            return ResponseEntity.ok(createdActivity);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING ACTIVITY ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update activity", description = "Update an existing activity")
    public ResponseEntity<ActivityDTO> updateActivity(
            @Parameter(description = "ID of the activity to update")
            @PathVariable Long id,
            @Parameter(description = "Updated activity object")
            @Valid @RequestBody ActivityDTO activityDTO) {
        try {
            System.out.println("=== UPDATING ACTIVITY ===");
            System.out.println("Activity ID: " + id);
            System.out.println("Activity DTO: " + activityDTO);
            
            Optional<Activity> existingActivity = activityRepository.findById(id);
            if (existingActivity.isPresent()) {
                Activity activity = existingActivity.get();
                
                // Update fields
                activity.setName(activityDTO.getName());
                activity.setDescription(activityDTO.getDescription());
                activity.setStartTime(activityDTO.getStartTime() != null ? 
                    java.time.LocalTime.parse(activityDTO.getStartTime()) : null);
                activity.setEndTime(activityDTO.getEndTime() != null ? 
                    java.time.LocalTime.parse(activityDTO.getEndTime()) : null);
                activity.setCost(activityDTO.getCost());
                activity.setDurationHours(activityDTO.getDurationHours() != null ? 
                    activityDTO.getDurationHours().intValue() : null);
                activity.setType(activityDTO.getType());
                activity.setStatus(activityDTO.getStatus());
                
                Activity savedActivity = activityRepository.save(activity);
                ActivityDTO updatedDTO = convertToActivityDTO(savedActivity);
                
                System.out.println("✅ Activity updated successfully: " + updatedDTO.getName());
                return ResponseEntity.ok(updatedDTO);
            } else {
                System.out.println("❌ Activity not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR UPDATING ACTIVITY ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete activity", description = "Delete an activity by its ID")
    public ResponseEntity<Void> deleteActivity(
            @Parameter(description = "ID of the activity to delete")
            @PathVariable Long id) {
        try {
            System.out.println("=== DELETING ACTIVITY ===");
            System.out.println("Activity ID: " + id);
            
            if (activityRepository.existsById(id)) {
                activityRepository.deleteById(id);
                System.out.println("✅ Activity deleted successfully");
                return ResponseEntity.noContent().build();
            } else {
                System.out.println("❌ Activity not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== ERROR DELETING ACTIVITY ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trip/{tripId}/status/{status}")
    @Operation(summary = "Get activities by trip and status", description = "Get activities filtered by trip and status")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTripAndStatus(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId,
            @Parameter(description = "Activity status")
            @PathVariable String status) {
        // TODO: Implement status filtering
        List<ActivityDTO> activities = tripService.getActivitiesByTripId(tripId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/trip/{tripId}/type/{type}")
    @Operation(summary = "Get activities by trip and type", description = "Get activities filtered by trip and type")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByTripAndType(
            @Parameter(description = "ID of the trip")
            @PathVariable Long tripId,
            @Parameter(description = "Activity type")
            @PathVariable String type) {
        // TODO: Implement type filtering
        List<ActivityDTO> activities = tripService.getActivitiesByTripId(tripId);
        return ResponseEntity.ok(activities);
    }

    // Helper method to convert Activity entity to ActivityDTO
    private ActivityDTO convertToActivityDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setName(activity.getName());
        dto.setDescription(activity.getDescription());
        dto.setStartTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null);
        dto.setEndTime(activity.getEndTime() != null ? activity.getEndTime().toString() : null);
        dto.setCost(activity.getCost());
        dto.setDurationHours(activity.getDurationHours() != null ? 
            java.math.BigDecimal.valueOf(activity.getDurationHours()) : null);
        dto.setType(activity.getType());
        dto.setStatus(activity.getStatus());
        dto.setTripId(activity.getTrip() != null ? activity.getTrip().getId() : null);
        dto.setItineraryId(activity.getItinerary() != null ? activity.getItinerary().getId() : null);
        dto.setPlaceId(activity.getPlace() != null ? activity.getPlace().getId() : null);
        dto.setCreatedAt(activity.getCreatedAt());
        dto.setUpdatedAt(activity.getUpdatedAt());
        return dto;
    }
}