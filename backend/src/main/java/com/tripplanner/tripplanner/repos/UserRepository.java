package com.tripplanner.tripplanner.repos;

import com.tripplanner.tripplanner.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAllByTripsId(Long tripId);

}
