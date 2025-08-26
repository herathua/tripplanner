package com.tripplanner.tripplanner.service;

import com.tripplanner.tripplanner.domain.ItineraryItem;
import com.tripplanner.tripplanner.domain.Trip;
import com.tripplanner.tripplanner.model.ItineraryItemDTO;
import com.tripplanner.tripplanner.repos.ItineraryItemRepository;
import com.tripplanner.tripplanner.repos.TripRepository;
import com.tripplanner.tripplanner.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class ItineraryItemService {

    private final ItineraryItemRepository itineraryItemRepository;
    private final TripRepository tripRepository;

    public ItineraryItemService(final ItineraryItemRepository itineraryItemRepository,
            final TripRepository tripRepository) {
        this.itineraryItemRepository = itineraryItemRepository;
        this.tripRepository = tripRepository;
    }

    public List<ItineraryItemDTO> findAll() {
        final List<ItineraryItem> itineraryItems = itineraryItemRepository.findAll(Sort.by("id"));
        return itineraryItems.stream()
                .map(itineraryItem -> mapToDTO(itineraryItem, new ItineraryItemDTO()))
                .toList();
    }

    public ItineraryItemDTO get(final Long id) {
        return itineraryItemRepository.findById(id)
                .map(itineraryItem -> mapToDTO(itineraryItem, new ItineraryItemDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final ItineraryItemDTO itineraryItemDTO) {
        final ItineraryItem itineraryItem = new ItineraryItem();
        mapToEntity(itineraryItemDTO, itineraryItem);
        return itineraryItemRepository.save(itineraryItem).getId();
    }

    public void update(final Long id, final ItineraryItemDTO itineraryItemDTO) {
        final ItineraryItem itineraryItem = itineraryItemRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(itineraryItemDTO, itineraryItem);
        itineraryItemRepository.save(itineraryItem);
    }

    public void delete(final Long id) {
        final ItineraryItem itineraryItem = itineraryItemRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        itineraryItemRepository.delete(itineraryItem);
    }

    private ItineraryItemDTO mapToDTO(final ItineraryItem itineraryItem,
            final ItineraryItemDTO itineraryItemDTO) {
        itineraryItemDTO.setId(itineraryItem.getId());
        itineraryItemDTO.setDayNumber(itineraryItem.getDayNumber());
        itineraryItemDTO.setTitle(itineraryItem.getTitle());
        itineraryItemDTO.setDescription(itineraryItem.getDescription());
        itineraryItemDTO.setLocation(itineraryItem.getLocation());
        itineraryItemDTO.setTrip(itineraryItem.getTrip() == null ? null : itineraryItem.getTrip().getId());
        return itineraryItemDTO;
    }

    private ItineraryItem mapToEntity(final ItineraryItemDTO itineraryItemDTO,
            final ItineraryItem itineraryItem) {
        itineraryItem.setDayNumber(itineraryItemDTO.getDayNumber());
        itineraryItem.setTitle(itineraryItemDTO.getTitle());
        itineraryItem.setDescription(itineraryItemDTO.getDescription());
        itineraryItem.setLocation(itineraryItemDTO.getLocation());
        final Trip trip = itineraryItemDTO.getTrip() == null ? null : tripRepository.findById(itineraryItemDTO.getTrip())
                .orElseThrow(() -> new NotFoundException("trip not found"));
        itineraryItem.setTrip(trip);
        return itineraryItem;
    }

}
