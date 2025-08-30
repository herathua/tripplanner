package com.tripplanner.tripplanner.repos;

import com.tripplanner.tripplanner.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u JOIN u.trips t WHERE t.id = :tripId")
    List<User> findAllByTripsId(@Param("tripId") Long tripId);
}
