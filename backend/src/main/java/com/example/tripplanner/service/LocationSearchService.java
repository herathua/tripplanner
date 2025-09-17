package com.example.tripplanner.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class LocationSearchService {
    
    @Value("${booking.api.key:a0997d222fmsh50214de9dec9326p145269jsn3f760d1a9ee5}")
    private String apiKey;
    
    @Value("${booking.api.host:booking-com-api5.p.rapidapi.com}")
    private String apiHost;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public Map<String, Object> searchLocations(String query, String languageCode, int limit) {
        try {
            // ✅ Try Booking.com API first
            String url = UriComponentsBuilder
                .fromHttpUrl("https://" + apiHost + "/accomodation/autocomplete")
                .queryParam("languagecode", languageCode)
                .queryParam("limit", limit)
                .queryParam("query", query)
                .queryParam("currency_code", "USD")
                .build()
                .toUriString();
            
            System.out.println("🔍 Booking.com API URL: " + url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Rapidapi-Key", apiKey);
            headers.set("X-Rapidapi-Host", apiHost);
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            System.out.println("📡 Making request to Booking.com API...");
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                Map.class
            );
            
            System.out.println("✅ Booking.com API response status: " + response.getStatusCode());
            System.out.println("📊 Response body: " + response.getBody());
            
            return response.getBody();
            
        } catch (Exception e) {
            System.err.println("❌ Booking.com API failed: " + e.getMessage());
            
            // ✅ Fallback to OpenStreetMap Nominatim API (free)
            try {
                System.out.println("🔄 Trying OpenStreetMap Nominatim API as fallback...");
                return searchWithNominatim(query, limit);
            } catch (Exception fallbackError) {
                System.err.println("❌ Nominatim API also failed: " + fallbackError.getMessage());
                
                // Return a structured error response
                return Map.of(
                    "success", false,
                    "error", "Both Booking.com and Nominatim APIs failed",
                    "message", "Failed to fetch location data from all APIs"
                );
            }
        }
    }
    
    private Map<String, Object> searchWithNominatim(String query, int limit) {
        try {
            String nominatimUrl = UriComponentsBuilder
                .fromHttpUrl("https://nominatim.openstreetmap.org/search")
                .queryParam("q", query)
                .queryParam("format", "json")
                .queryParam("limit", limit)
                .queryParam("addressdetails", "1")
                .build()
                .toUriString();
            
            System.out.println("🌍 Nominatim API URL: " + nominatimUrl);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TripPlanner/1.0");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Object[]> response = restTemplate.exchange(
                nominatimUrl,
                HttpMethod.GET,
                entity,
                Object[].class
            );
            
            Object[] results = response.getBody();
            System.out.println("✅ Nominatim API response: " + results.length + " results");
            
            // Transform Nominatim results to match Booking.com format
            return transformNominatimResults(results);
            
        } catch (Exception e) {
            System.err.println("❌ Nominatim API error: " + e.getMessage());
            throw e;
        }
    }
    
    private Map<String, Object> transformNominatimResults(Object[] results) {
        // Transform Nominatim results to match expected format
        java.util.List<Map<String, Object>> transformedResults = new java.util.ArrayList<>();
        
        for (Object result : results) {
            if (result instanceof Map) {
                Map<String, Object> place = (Map<String, Object>) result;
                
                Map<String, Object> transformedPlace = Map.of(
                    "destination", Map.of(
                        "destId", place.get("place_id").toString(),
                        "destType", "CITY",
                        "latitude", Double.parseDouble(place.get("lat").toString()),
                        "longitude", Double.parseDouble(place.get("lon").toString()),
                        "nbHotels", 0
                    ),
                    "displayInfo", Map.of(
                        "title", place.get("display_name").toString().split(",")[0],
                        "subTitle", place.get("display_name").toString(),
                        "absoluteImageUrl", "https://images.unsplash.com/photo-1480714378408-67cf0d13bc02?w=400&h=300&fit=crop",
                        "labelComponents", java.util.List.of(
                            Map.of("type", "CITY", "name", place.get("display_name").toString().split(",")[0]),
                            Map.of("type", "COUNTRY", "name", "Unknown")
                        )
                    )
                );
                
                transformedResults.add(transformedPlace);
            }
        }
        
        return Map.of(
            "success", true,
            "data", Map.of(
                "data", Map.of(
                    "autoCompleteSuggestions", Map.of(
                        "results", transformedResults
                    )
                )
            )
        );
    }
}
