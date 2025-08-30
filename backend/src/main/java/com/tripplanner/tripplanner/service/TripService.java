package com.tripplanner.tripplanner.service;

import com.tripplanner.tripplanner.domain.ItineraryItem;
import com.tripplanner.tripplanner.domain.Trip;
import com.tripplanner.tripplanner.domain.User;
import com.tripplanner.tripplanner.model.TripDTO;
import com.tripplanner.tripplanner.repos.ItineraryItemRepository;
import com.tripplanner.tripplanner.repos.TripRepository;
import com.tripplanner.tripplanner.repos.UserRepository;
import com.tripplanner.tripplanner.util.NotFoundException;
import java.util.HashSet;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(rollbackFor = Exception.class)
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ItineraryItemRepository itineraryItemRepository;

    public TripService(final TripRepository tripRepository, final UserRepository userRepository,
            final ItineraryItemRepository itineraryItemRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.itineraryItemRepository = itineraryItemRepository;
    }

    public List<TripDTO> findAll() {
        final List<Trip> trips = tripRepository.findAll(Sort.by("id"));
        return trips.stream()
                .map(trip -> mapToDTO(trip, new TripDTO()))
                .toList();
    }

    public TripDTO get(final Long id) {
        return tripRepository.findById(id)
                .map(trip -> mapToDTO(trip, new TripDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final TripDTO tripDTO) {
        final Trip trip = new Trip();
        mapToEntity(tripDTO, trip);
        return tripRepository.save(trip).getId();
    }

    public void update(final Long id, final TripDTO tripDTO) {
        final Trip trip = tripRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(tripDTO, trip);
        tripRepository.save(trip);
    }

    public void delete(final Long id) {
        final Trip trip = tripRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        tripRepository.delete(trip);
    }

    private TripDTO mapToDTO(final Trip trip, final TripDTO tripDTO) {
        tripDTO.setId(trip.getId());
        tripDTO.setTitle(trip.getTitle());
        tripDTO.setDestination(trip.getDestination());
        tripDTO.setStartDate(trip.getStartDate());
        tripDTO.setEndDate(trip.getEndDate());
        tripDTO.setBudget(trip.getBudget());
        tripDTO.setUser(trip.getUser().stream()
                .map(user -> user.getId())
                .toList());
        tripDTO.setItineraryItems(trip.getItineraryItems().stream()
                .map(itineraryItem -> itineraryItem.getId())
                .toList());
        return tripDTO;
    }

    private Trip mapToEntity(final TripDTO tripDTO, final Trip trip) {
        trip.setTitle(tripDTO.getTitle());
        trip.setDestination(tripDTO.getDestination());
        trip.setStartDate(tripDTO.getStartDate());
        trip.setEndDate(tripDTO.getEndDate());
        trip.setBudget(tripDTO.getBudget());
        final List<User> user = userRepository.findAllById(
                tripDTO.getUser() == null ? List.of() : tripDTO.getUser());
        if (user.size() != (tripDTO.getUser() == null ? 0 : tripDTO.getUser().size())) {
            throw new NotFoundException("one of user not found");
        }
        trip.setUser(new HashSet<>(user));
        final List<ItineraryItem> itineraryItems = itineraryItemRepository.findAllById(
                tripDTO.getItineraryItems() == null ? List.of() : tripDTO.getItineraryItems());
        if (itineraryItems.size() != (tripDTO.getItineraryItems() == null ? 0 : tripDTO.getItineraryItems().size())) {
            throw new NotFoundException("one of itineraryItems not found");
        }
        trip.setItineraryItems(new HashSet<>(itineraryItems));
        return trip;
    }

}