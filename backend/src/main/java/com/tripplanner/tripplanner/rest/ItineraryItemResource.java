package com.tripplanner.tripplanner.rest;

import com.tripplanner.tripplanner.model.ItineraryItemDTO;
import com.tripplanner.tripplanner.service.ItineraryItemService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
@RequestMapping(value = "/api/itineraryItems", produces = MediaType.APPLICATION_JSON_VALUE)
public class ItineraryItemResource {

    private final ItineraryItemService itineraryItemService;

    public ItineraryItemResource(final ItineraryItemService itineraryItemService) {
        this.itineraryItemService = itineraryItemService;
    }

    @GetMapping
    public ResponseEntity<List<ItineraryItemDTO>> getAllItineraryItems() {
        return ResponseEntity.ok(itineraryItemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItineraryItemDTO> getItineraryItem(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(itineraryItemService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createItineraryItem(
            @RequestBody @Valid final ItineraryItemDTO itineraryItemDTO) {
        final Long createdId = itineraryItemService.create(itineraryItemDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateItineraryItem(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final ItineraryItemDTO itineraryItemDTO) {
        itineraryItemService.update(id, itineraryItemDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteItineraryItem(@PathVariable(name = "id") final Long id) {
        itineraryItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
