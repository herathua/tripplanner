package com.example.tripplanner.controller;

import com.example.tripplanner.model.Trip;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TestController {

    @GetMapping("/cors")
    public String testCors() {
        return "CORS is working!";
    }

    @PostMapping("/cors")
    public String testCorsPost(@RequestBody String data) {
        return "CORS POST is working! Received: " + data;
    }

    @PostMapping("/trip-debug")
    public String testTripCreation(@RequestBody Trip trip) {
        return "Trip received: " + trip.toString();
    }

    @PostMapping("/trip-raw")
    public String testTripRaw(@RequestBody String rawData) {
        return "Raw trip data received: " + rawData;
    }

    @PostMapping("/trip-simple")
    public String testTripSimple(@RequestBody TripRequest request) {
        return "Simple trip request: " + request.toString();
    }

    // Simple DTO for testing
    public static class TripRequest {
        public String title;
        public String destination;
        public String startDate;
        public String endDate;
        public Number budget;

        @Override
        public String toString() {
            return String.format("TripRequest{title='%s', destination='%s', startDate='%s', endDate='%s', budget=%s}", 
                title, destination, startDate, endDate, budget);
        }
    }
}
