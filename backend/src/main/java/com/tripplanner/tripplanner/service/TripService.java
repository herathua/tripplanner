package com.tripplanner.tripplanner.service;

import com.tripplanner.tripplanner.domain.Trip;
import com.tripplanner.tripplanner.model.TripDTO;
import com.tripplanner.tripplanner.repos.TripRepository;
import com.tripplanner.tripplanner.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(final TripRepository tripRepository) {
        this.tripRepository = tripRepository;
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
        tripRepository.deleteById(id);
    }

    private TripDTO mapToDTO(final Trip trip, final TripDTO tripDTO) {
        tripDTO.setId(trip.getId());
        tripDTO.setTitle(trip.getTitle());
        tripDTO.setDestination(trip.getDestination());
        tripDTO.setStartDate(trip.getStartDate());
        tripDTO.setEndDate(trip.getEndDate());
        tripDTO.setBudget(trip.getBudget());
        tripDTO.setDateCreated(trip.getDateCreated());
        tripDTO.setLastUpdated(trip.getLastUpdated());
        return tripDTO;
    }

    private Trip mapToEntity(final TripDTO tripDTO, final Trip trip) {
        trip.setTitle(tripDTO.getTitle());
        trip.setDestination(tripDTO.getDestination());
        trip.setStartDate(tripDTO.getStartDate());
        trip.setEndDate(tripDTO.getEndDate());
        trip.setBudget(tripDTO.getBudget());
        return trip;
    }

}