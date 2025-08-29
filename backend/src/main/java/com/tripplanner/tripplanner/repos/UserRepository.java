package com.tripplanner.tripplanner.repos;

import com.tripplanner.tripplanner.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAllByTripsId(Long tripId);
}
