package com.example.tripplanner.controller;

import com.example.tripplanner.service.LocationSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/locations")
@Tag(name = "Location Search", description = "APIs for searching locations")
public class LocationSearchController {

    @Autowired
    private LocationSearchService locationSearchService;

    @GetMapping("/search")
    @Operation(summary = "Search locations", description = "Search for locations using Booking.com API")
    public ResponseEntity<Map<String, Object>> searchLocations(
            @Parameter(description = "Search query") 
            @RequestParam String query,
            @Parameter(description = "Language code (default: en)") 
            @RequestParam(defaultValue = "en") String languageCode,
            @Parameter(description = "Maximum number of results (default: 3)") 
            @RequestParam(defaultValue = "3") int limit) {
        
        try {
            System.out.println("Location search request - Query: " + query + ", Language: " + languageCode + ", Limit: " + limit);
            
            // Validate input
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Query parameter is required and cannot be empty"
                ));
            }
            
            if (query.trim().length() < 2) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Query must be at least 2 characters long"
                ));
            }
            
            Map<String, Object> results = locationSearchService.searchLocations(query.trim(), languageCode, limit);
            return ResponseEntity.ok(results);
            
        } catch (Exception e) {
            System.err.println("Error in location search controller: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to search locations: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/test")
    @Operation(summary = "Test location search", description = "Test endpoint to verify location search is working")
    public ResponseEntity<Map<String, Object>> testLocationSearch() {
        try {
            System.out.println("Testing location search endpoint...");
            
            // Test with a simple query
            Map<String, Object> results = locationSearchService.searchLocations("paris", "en", 3);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Location search test successful",
                "testResults", results
            ));
            
        } catch (Exception e) {
            System.err.println("Location search test failed: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Location search test failed",
                "error", e.getMessage()
            ));
        }
    }
}
