package com.tripplanner.tripplanner.service;

import com.tripplanner.tripplanner.domain.Trip;
import com.tripplanner.tripplanner.domain.User;
import com.tripplanner.tripplanner.events.BeforeDeleteTrip;
import com.tripplanner.tripplanner.model.UserDTO;
import com.tripplanner.tripplanner.repos.TripRepository;
import com.tripplanner.tripplanner.repos.UserRepository;
import com.tripplanner.tripplanner.util.NotFoundException;
import java.util.HashSet;
import java.util.List;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional(rollbackFor = Exception.class)
public class UserService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public UserService(final UserRepository userRepository, final TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
    }

    public List<UserDTO> findAll() {
        final List<User> users = userRepository.findAll(Sort.by("id"));
        return users.stream()
                .map(user -> mapToDTO(user, new UserDTO()))
                .toList();
    }

    public UserDTO get(final Long id) {
        return userRepository.findById(id)
                .map(user -> mapToDTO(user, new UserDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final UserDTO userDTO) {
        final User user = new User();
        mapToEntity(userDTO, user);
        return userRepository.save(user).getId();
    }

    public void update(final Long id, final UserDTO userDTO) {
        final User user = userRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(userDTO, user);
        userRepository.save(user);
    }

    public void delete(final Long id) {
        final User user = userRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        userRepository.delete(user);
    }

    private UserDTO mapToDTO(final User user, final UserDTO userDTO) {
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setTrips(user.getTrips().stream()
                .map(trip -> trip.getId())
                .toList());
        return userDTO;
    }

    private User mapToEntity(final UserDTO userDTO, final User user) {
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        final List<Trip> trips = tripRepository.findAllById(
                userDTO.getTrips() == null ? List.of() : userDTO.getTrips());
        if (trips.size() != (userDTO.getTrips() == null ? 0 : userDTO.getTrips().size())) {
            throw new NotFoundException("one of trips not found");
        }
        user.setTrips(new HashSet<>(trips));
        return user;
    }

    @EventListener(BeforeDeleteTrip.class)
    public void on(final BeforeDeleteTrip event) {
        // remove many-to-many relations at owning side
        userRepository.findAllByTripsId(event.getId()).forEach(user ->
                user.getTrips().removeIf(trip -> trip.getId().equals(event.getId())));
    }

}
