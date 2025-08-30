package com.tripplanner.tripplanner.rest;

import com.tripplanner.tripplanner.model.TripDTO;
import com.tripplanner.tripplanner.service.TripService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(value = "/api/trips", produces = MediaType.APPLICATION_JSON_VALUE)
public class TripResource {

    private final TripService tripService;

    public TripResource(final TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public ResponseEntity<List<TripDTO>> getAllTrips() {
        return ResponseEntity.ok(tripService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDTO> getTrip(@PathVariable final Long id) {
        return ResponseEntity.ok(tripService.get(id));
    }

    @PostMapping
    public ResponseEntity<Long> createTrip(@RequestBody @Valid final TripDTO tripDTO) {
        final Long createdId = tripService.create(tripDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTrip(@PathVariable final Long id,
            @RequestBody @Valid final TripDTO tripDTO) {
        tripService.update(id, tripDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable final Long id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }

}