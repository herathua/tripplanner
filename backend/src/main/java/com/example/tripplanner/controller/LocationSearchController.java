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
        
        System.out.println("🔍 LocationSearchController: Received search request");
        System.out.println("   Query: " + query);
        System.out.println("   Language: " + languageCode);
        System.out.println("   Limit: " + limit);
        
        try {
            Map<String, Object> results = locationSearchService.searchLocations(query, languageCode, limit);
            System.out.println("✅ LocationSearchController: Successfully retrieved results");
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("❌ LocationSearchController: Error occurred - " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Failed to search locations"
            ));
        }
    }

    @GetMapping("/test")
    @Operation(summary = "Test Booking.com API", description = "Test if Booking.com API is accessible")
    public ResponseEntity<Map<String, Object>> testAPI() {
        System.out.println("🧪 Testing Booking.com API connection...");
        
        try {
            // Test with a simple query
            Map<String, Object> results = locationSearchService.searchLocations("Paris", "en", 1);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Booking.com API is working",
                "testResults", results
            ));
        } catch (Exception e) {
            System.err.println("❌ Booking.com API test failed: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Booking.com API test failed"
            ));
        }
    }
}
