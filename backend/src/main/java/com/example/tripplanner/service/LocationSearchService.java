package com.example.tripplanner.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class LocationSearchService {
    
    @Value("${booking.api.key:bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744}")
    private String apiKey;
    
    @Value("${booking.api.host:booking-com-api5.p.rapidapi.com}")
    private String apiHost;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public Map<String, Object> searchLocations(String query, String languageCode, int limit) {
        String url = String.format(
            "https://%s/accomodation/autocomplete?languagecode=%s&limit=%d&query=%s&currency_code=USD",
            apiHost, languageCode, limit, query
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Rapidapi-Key", apiKey);
        headers.set("X-Rapidapi-Host", apiHost);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            url, 
            HttpMethod.GET, 
            entity, 
            Map.class
        );
        
        return response.getBody();
    }
}
