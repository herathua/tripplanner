package com.example.tripplanner.controller;

import com.example.tripplanner.model.Activity;
import com.example.tripplanner.repository.ActivityRepository;
import com.example.tripplanner.repository.ItineraryRepository;
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
@RequestMapping("/activities")
@Tag(name = "Activity Management", description = "APIs for managing trip activities")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Get activities by trip ID", description = "Retrieve all activities for a specific trip")
    public ResponseEntity<List<Activity>> getActivitiesByTripId(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId) {
        Optional<com.example.tripplanner.model.Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Activity> activities = activityRepository.findByTrip(trip.get());
            return ResponseEntity.ok(activities);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/itinerary/{itineraryId}")
    @Operation(summary = "Get activities by itinerary ID", description = "Retrieve all activities for a specific itinerary")
    public ResponseEntity<List<Activity>> getActivitiesByItineraryId(
            @Parameter(description = "ID of the itinerary") 
            @PathVariable Long itineraryId) {
        Optional<com.example.tripplanner.model.Itinerary> itinerary = itineraryRepository.findById(itineraryId);
        if (itinerary.isPresent()) {
            List<Activity> activities = activityRepository.findByItinerary(itinerary.get());
            return ResponseEntity.ok(activities);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get activity by ID", description = "Retrieve a specific activity by its ID")
    public ResponseEntity<Activity> getActivityById(
            @Parameter(description = "ID of the activity to retrieve") 
            @PathVariable Long id) {
        Optional<Activity> activity = activityRepository.findById(id);
        return activity.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new activity", description = "Create a new activity for an itinerary")
    public ResponseEntity<Activity> createActivity(
            @Parameter(description = "Activity object to create") 
            @RequestBody Activity activity) {
        Activity savedActivity = activityRepository.save(activity);
        return ResponseEntity.ok(savedActivity);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an activity", description = "Update an existing activity by its ID")
    public ResponseEntity<Activity> updateActivity(
            @Parameter(description = "ID of the activity to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated activity object") 
            @RequestBody Activity activityDetails) {
        Optional<Activity> existingActivity = activityRepository.findById(id);
        if (existingActivity.isPresent()) {
            Activity activity = existingActivity.get();
            activity.setName(activityDetails.getName());
            activity.setDescription(activityDetails.getDescription());
            activity.setStartTime(activityDetails.getStartTime());
            activity.setEndTime(activityDetails.getEndTime());
            activity.setCost(activityDetails.getCost());
            activity.setDurationHours(activityDetails.getDurationHours());
            activity.setType(activityDetails.getType());
            activity.setStatus(activityDetails.getStatus());
            
            Activity updatedActivity = activityRepository.save(activity);
            return ResponseEntity.ok(updatedActivity);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an activity", description = "Delete an activity by its ID")
    public ResponseEntity<Void> deleteActivity(
            @Parameter(description = "ID of the activity to delete") 
            @PathVariable Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/status/{status}")
    @Operation(summary = "Get activities by trip and status", description = "Retrieve activities for a trip filtered by status")
    public ResponseEntity<List<Activity>> getActivitiesByTripAndStatus(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "Status to filter by") 
            @PathVariable Activity.ActivityStatus status) {
        Optional<com.example.tripplanner.model.Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Activity> activities = activityRepository.findByTripAndStatus(trip.get(), status);
            return ResponseEntity.ok(activities);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trip/{tripId}/type/{type}")
    @Operation(summary = "Get activities by trip and type", description = "Retrieve activities for a trip filtered by type")
    public ResponseEntity<List<Activity>> getActivitiesByTripAndType(
            @Parameter(description = "ID of the trip") 
            @PathVariable Long tripId,
            @Parameter(description = "Type to filter by") 
            @PathVariable Activity.ActivityType type) {
        Optional<com.example.tripplanner.model.Trip> trip = tripRepository.findById(tripId);
        if (trip.isPresent()) {
            List<Activity> activities = activityRepository.findByTripAndType(trip.get(), type);
            return ResponseEntity.ok(activities);
        }
        return ResponseEntity.notFound().build();
    }
}
