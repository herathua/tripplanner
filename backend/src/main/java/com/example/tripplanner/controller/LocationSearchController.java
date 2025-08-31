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
            Map<String, Object> results = locationSearchService.searchLocations(query, languageCode, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
